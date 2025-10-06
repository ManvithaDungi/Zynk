/**
 * Socket.IO Handler
 * Manages real-time WebSocket connections and events
 * Handles chat messages, polls, user status, and live updates
 */

const User = require('../models/User');
const ChatChatMessage = require('../models/ChatChatMessage');
const Poll = require('../models/Poll');

/**
 * Initialize Socket.IO with the server
 * @param {Object} io - Socket.IO instance
 */
function initializeSocket(io) {
  // Namespace for collaboration hub
  const collaborationNamespace = io.of('/collaboration');
  
  collaborationNamespace.on('connection', async (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);
    
    // Store user info in socket
    let currentUser = null;
    
    /**
     * USER AUTHENTICATION & STATUS
     */
    
    // Handle user login/join
    socket.on('user:join', async (userData) => {
      try {
        const { userId, username } = userData;
        
        // Find or create user
        let user = await User.findById(userId);
        
        if (!user && username) {
          // Create temporary user if not exists
          user = await User.create({
            username,
            email: `${username.toLowerCase().replace(/\s/g, '')}@temp.com`,
            isActive: true,
            status: 'online'
          });
        } else if (user) {
          // Update existing user status
          await user.setActive(socket.id);
        }
        
        currentUser = user;
        socket.userId = user._id.toString();
        
        // Join user's personal room
        socket.join(`user:${user._id}`);
        
        // Broadcast user joined to all clients
        collaborationNamespace.emit('user:joined', {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            status: user.status,
            isActive: user.isActive
          }
        });
        
        // Send active users list to the new user
        const activeUsers = await User.getActiveUsers();
        socket.emit('users:list', { users: activeUsers });
        
        // Send confirmation to user
        socket.emit('user:authenticated', {
          success: true,
          user: user
        });
        
        console.log(`✅ User joined: ${user.username} (${socket.id})`);
      } catch (error) {
        console.error('Error in user:join:', error);
        socket.emit('error', { message: 'Failed to join', error: error.message });
      }
    });
    
    // Handle user disconnect
    socket.on('disconnect', async () => {
      try {
        if (currentUser) {
          await currentUser.setInactive();
          
          // Broadcast user left
          collaborationNamespace.emit('user:left', {
            userId: currentUser._id,
            username: currentUser.username
          });
          
          console.log(`👋 User disconnected: ${currentUser.username}`);
        } else {
          console.log(`👋 Client disconnected: ${socket.id}`);
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
    
    // Handle user status change
    socket.on('user:status', async (data) => {
      try {
        const { userId, status } = data;
        
        const user = await User.findById(userId);
        if (user) {
          user.status = status;
          await user.save();
          
          // Broadcast status change
          collaborationNamespace.emit('user:statusChanged', {
            userId: user._id,
            username: user.username,
            status: user.status
          });
        }
      } catch (error) {
        console.error('Error updating user status:', error);
        socket.emit('error', { message: 'Failed to update status', error: error.message });
      }
    });
    
    /**
     * CHAT MESSAGES
     */
    
    // Handle new message
    socket.on('message:send', async (messageData) => {
      try {
        const { sender, senderName, content, messageType } = messageData;
        
        // Create message in database
        const message = await ChatMessage.create({
          sender,
          senderName,
          content,
          messageType: messageType || 'text'
        });
        
        // Populate sender info
        await message.populate('sender', 'username email avatar status');
        
        // Broadcast to all clients
        collaborationNamespace.emit('message:new', {
          message: message
        });
        
        console.log(`💬 New message from ${senderName}: ${content.substring(0, 50)}...`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message', error: error.message });
      }
    });
    
    // Handle message edit
    socket.on('message:edit', async (data) => {
      try {
        const { messageId, content } = data;
        
        const message = await ChatMessage.findById(messageId);
        if (message) {
          await message.editChatMessage(content);
          await message.populate('sender', 'username email avatar status');
          
          // Broadcast update
          collaborationNamespace.emit('message:updated', {
            message: message
          });
        }
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message', error: error.message });
      }
    });
    
    // Handle message delete
    socket.on('message:delete', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await ChatMessage.findByIdAndDelete(messageId);
        if (message) {
          // Broadcast deletion
          collaborationNamespace.emit('message:deleted', {
            messageId: messageId
          });
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message', error: error.message });
      }
    });
    
    // Handle typing indicator
    socket.on('message:typing', (data) => {
      const { username, isTyping } = data;
      
      // Broadcast typing status to others
      socket.broadcast.emit('message:userTyping', {
        username,
        isTyping
      });
    });
    
    /**
     * POLLS
     */
    
    // Handle new poll creation
    socket.on('poll:create', async (pollData) => {
      try {
        const { question, description, options, createdBy, allowMultipleVotes, pollType, expiresAt } = pollData;
        
        // Get creator info
        const creator = await User.findById(createdBy);
        
        // Format options
        const formattedOptions = options.map(option => ({
          optionText: typeof option === 'string' ? option : option.optionText,
          votes: 0,
          voters: []
        }));
        
        // Create poll
        const poll = await Poll.create({
          question,
          description: description || '',
          options: formattedOptions,
          createdBy,
          creatorName: creator.username,
          allowMultipleVotes: allowMultipleVotes || false,
          pollType: pollType || 'single',
          expiresAt: expiresAt || null
        });
        
        await poll.populate('createdBy', 'username email avatar');
        
        // Broadcast new poll
        collaborationNamespace.emit('poll:new', {
          poll: poll
        });
        
        console.log(`📊 New poll created: ${question}`);
      } catch (error) {
        console.error('Error creating poll:', error);
        socket.emit('error', { message: 'Failed to create poll', error: error.message });
      }
    });
    
    // Handle vote
    socket.on('poll:vote', async (voteData) => {
      try {
        const { pollId, userId, optionId } = voteData;
        
        const poll = await Poll.findById(pollId);
        if (!poll) {
          socket.emit('error', { message: 'Poll not found' });
          return;
        }
        
        // Cast vote
        await poll.castVote(userId, optionId);
        await poll.populate('createdBy', 'username email avatar');
        
        // Broadcast updated poll to all clients
        collaborationNamespace.emit('poll:updated', {
          poll: poll
        });
        
        console.log(`✅ Vote cast in poll: ${poll.question}`);
      } catch (error) {
        console.error('Error casting vote:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Handle vote removal
    socket.on('poll:removeVote', async (voteData) => {
      try {
        const { pollId, userId, optionId } = voteData;
        
        const poll = await Poll.findById(pollId);
        if (poll) {
          await poll.removeVote(userId, optionId);
          await poll.populate('createdBy', 'username email avatar');
          
          // Broadcast update
          collaborationNamespace.emit('poll:updated', {
            poll: poll
          });
        }
      } catch (error) {
        console.error('Error removing vote:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Handle poll close
    socket.on('poll:close', async (data) => {
      try {
        const { pollId } = data;
        
        const poll = await Poll.findById(pollId);
        if (poll) {
          await poll.closePoll();
          
          // Broadcast update
          collaborationNamespace.emit('poll:updated', {
            poll: poll
          });
        }
      } catch (error) {
        console.error('Error closing poll:', error);
        socket.emit('error', { message: 'Failed to close poll', error: error.message });
      }
    });
    
    // Handle poll delete
    socket.on('poll:delete', async (data) => {
      try {
        const { pollId } = data;
        
        const poll = await Poll.findByIdAndDelete(pollId);
        if (poll) {
          // Broadcast deletion
          collaborationNamespace.emit('poll:deleted', {
            pollId: pollId
          });
        }
      } catch (error) {
        console.error('Error deleting poll:', error);
        socket.emit('error', { message: 'Failed to delete poll', error: error.message });
      }
    });
    
    /**
     * DASHBOARD & ANALYTICS
     */
    
    // Handle dashboard stats request
    socket.on('dashboard:getStats', async () => {
      try {
        const userStats = await User.getUserStats();
        const messageStats = await ChatMessage.getChatMessageStats();
        const pollStats = await Poll.getPollStats();
        
        socket.emit('dashboard:stats', {
          users: userStats,
          messages: messageStats,
          polls: pollStats,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        socket.emit('error', { message: 'Failed to fetch stats', error: error.message });
      }
    });
    
    // Broadcast dashboard updates periodically (every 5 seconds)
    const dashboardInterval = setInterval(async () => {
      try {
        const userStats = await User.getUserStats();
        const messageStats = await ChatMessage.getChatMessageStats();
        const pollStats = await Poll.getPollStats();
        
        collaborationNamespace.emit('dashboard:statsUpdate', {
          users: userStats,
          messages: messageStats,
          polls: pollStats,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error broadcasting dashboard stats:', error);
      }
    }, 5000);
    
    // Clear interval on disconnect
    socket.on('disconnect', () => {
      clearInterval(dashboardInterval);
    });
    
    /**
     * USER MANAGEMENT
     */
    
    // Handle user creation
    socket.on('user:create', async (userData) => {
      try {
        const { username, email } = userData;
        
        const user = await User.create({
          username,
          email,
          isActive: false,
          status: 'offline'
        });
        
        // Broadcast new user
        collaborationNamespace.emit('user:created', {
          user: user
        });
      } catch (error) {
        console.error('Error creating user:', error);
        socket.emit('error', { message: 'Failed to create user', error: error.message });
      }
    });
    
    // Handle user update
    socket.on('user:update', async (data) => {
      try {
        const { userId, updates } = data;
        
        const user = await User.findByIdAndUpdate(
          userId,
          { ...updates, lastActive: new Date() },
          { new: true, runValidators: true }
        );
        
        if (user) {
          // Broadcast update
          collaborationNamespace.emit('user:updated', {
            user: user
          });
        }
      } catch (error) {
        console.error('Error updating user:', error);
        socket.emit('error', { message: 'Failed to update user', error: error.message });
      }
    });
    
    // Handle user delete
    socket.on('user:delete', async (data) => {
      try {
        const { userId } = data;
        
        const user = await User.findByIdAndDelete(userId);
        if (user) {
          // Broadcast deletion
          collaborationNamespace.emit('user:deleted', {
            userId: userId
          });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        socket.emit('error', { message: 'Failed to delete user', error: error.message });
      }
    });
    
  });
  
  console.log('🚀 Socket.IO initialized successfully');
}

module.exports = { initializeSocket };