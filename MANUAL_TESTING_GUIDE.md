# 🧪 Enhanced Event Features - Manual Testing Guide

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend running on `http://localhost:3000`
3. MongoDB connected and running

## 🎯 Test Scenarios

### 1. **Enhanced Event Creation**
**Location:** `/create-event`

**Test Steps:**
1. Navigate to Create Event page
2. Fill in basic event information:
   - Title: "Test Enhanced Event"
   - Description: "Testing all new features"
   - Date: Future date
   - Time: Any time
   - Location: "Test Location"

3. **Test Category & Tag Selection:**
   - Select a category from the grid
   - Search for existing tags
   - Create new tags
   - Verify selected tags appear

4. **Test Enhanced Features:**
   - ✅ Enable waitlist
   - ✅ Enable chat
   - ✅ Enable reviews
   - ✅ Enable polls
   - ✅ Make shareable

5. **Test Recurring Events:**
   - ✅ Check "Make this a recurring event"
   - Select pattern (Weekly/Monthly)
   - Set end date (optional)

6. **Upload Event Image:**
   - Click upload area
   - Select an image file
   - Verify preview appears
   - Test remove image functionality

7. **Submit Event:**
   - Click "Create Event"
   - Verify success message
   - Check redirect to event detail page

**Expected Results:**
- Event created with all selected features
- Category and tags properly assigned
- Enhanced settings saved correctly

---

### 2. **Event Detail Page - Enhanced Features**
**Location:** `/event/{eventId}`

**Test Steps:**

#### **A. Basic Event Display**
1. Verify event information displays correctly
2. Check category and tags are shown
3. Verify registration count and max attendees
4. Test registration/unregistration buttons

#### **B. Waitlist Feature**
1. If event is full, verify "Event is Full" message
2. Test "Join Waitlist" button
3. Verify waitlist position display
4. Test "View Waitlist" to see other users
5. Test "Leave Waitlist" functionality

#### **C. Reviews Tab**
1. Click "Reviews" tab
2. Verify average rating display
3. If user is registered and event ended:
   - Click "Write a Review"
   - Fill in rating (1-5 stars)
   - Add review text
   - Submit review
   - Verify review appears in list
4. Test "Helpful" voting on reviews
5. Test sorting options (newest, oldest, highest, lowest)

#### **D. Polls Tab**
1. Click "Polls" tab
2. If user is organizer:
   - Click "Create Poll"
   - Add question and options
   - Set expiration date (optional)
   - Create poll
3. Vote on existing polls
4. Verify vote counts and percentages
5. Test multiple polls functionality

#### **E. Chat Feature**
1. If user is registered and chat enabled:
   - Click "Chat" button
   - Verify chat modal opens
   - Type a message and send
   - Verify message appears in real-time
   - Test typing indicators
   - Test multiple users chatting

#### **F. Share Feature**
1. Click "Share Event" button
2. Verify share modal opens
3. Test social media sharing buttons:
   - Twitter
   - Facebook
   - LinkedIn
   - WhatsApp
   - Telegram
   - Email
4. Test "Copy Link" functionality
5. Verify copied link works

#### **G. Memories Tab**
1. Click "Memories" tab
2. Test album creation
3. Test photo/video upload
4. Test memory viewing
5. Test album management

---

### 3. **Real-time Features Testing**

#### **A. Chat Testing (Multi-user)**
1. Open event in two different browsers/incognito windows
2. Register both users for the event
3. Open chat in both windows
4. Send messages from one window
5. Verify messages appear instantly in other window
6. Test typing indicators
7. Test message history loading

#### **B. Poll Updates**
1. Create a poll as organizer
2. Have other users vote
3. Verify vote counts update in real-time
4. Test poll expiration

---

### 4. **Search and Discovery**

#### **A. Category-based Search**
1. Go to upcoming events page
2. Filter by different categories
3. Verify events are properly categorized

#### **B. Tag-based Search**
1. Search for events by tags
2. Verify tag filtering works
3. Test popular tags display

---

### 5. **Mobile Responsiveness**
1. Test all features on mobile devices
2. Verify chat works on mobile
3. Test touch interactions
4. Verify responsive design

---

## 🐛 Common Issues to Check

### **Backend Issues:**
- [ ] Socket.io connection errors
- [ ] Database connection issues
- [ ] File upload problems
- [ ] Authentication token issues

### **Frontend Issues:**
- [ ] Component rendering errors
- [ ] API call failures
- [ ] Real-time connection problems
- [ ] Form validation issues

### **Integration Issues:**
- [ ] CORS errors
- [ ] Cookie/session problems
- [ ] File upload size limits
- [ ] Real-time message delivery

---

## 📊 Success Criteria

### **✅ All Features Working:**
- [ ] Event creation with categories and tags
- [ ] Real-time chat functionality
- [ ] Poll creation and voting
- [ ] Review and rating system
- [ ] Waitlist management
- [ ] Event sharing
- [ ] Recurring events
- [ ] Mobile responsiveness

### **✅ Performance:**
- [ ] Fast page load times
- [ ] Smooth real-time updates
- [ ] Responsive UI interactions
- [ ] Proper error handling

### **✅ User Experience:**
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Loading states
- [ ] Success feedback

---

## 🔧 Troubleshooting

### **If Chat Doesn't Work:**
1. Check browser console for Socket.io errors
2. Verify backend Socket.io setup
3. Check authentication tokens
4. Test with different browsers

### **If Polls Don't Update:**
1. Check poll creation API
2. Verify vote counting logic
3. Test with multiple users
4. Check database updates

### **If Reviews Don't Show:**
1. Verify review creation API
2. Check user permissions
3. Test with different users
4. Verify event end date logic

### **If Waitlist Doesn't Work:**
1. Check waitlist API endpoints
2. Verify position calculation
3. Test with full events
4. Check notification system

---

## 📝 Test Results Template

```
Test Date: ___________
Tester: ______________
Browser: _____________
Device: ______________

Feature Tests:
[ ] Event Creation with Categories/Tags
[ ] Real-time Chat
[ ] Polls System
[ ] Reviews & Ratings
[ ] Waitlist Management
[ ] Event Sharing
[ ] Recurring Events
[ ] Mobile Responsiveness

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Rating: ___/10
Recommendations: ________________
```

---

## 🚀 Next Steps After Testing

1. **Fix any critical bugs found**
2. **Optimize performance issues**
3. **Improve user experience based on feedback**
4. **Add additional features if needed**
5. **Deploy to production environment**
