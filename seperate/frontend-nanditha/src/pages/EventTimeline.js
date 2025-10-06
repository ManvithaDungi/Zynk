import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Timeline.css";

const API = process.env.REACT_APP_API || "http://localhost:5000/api";

export default function EventTimeline() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    media: "",
    tag: "",
    collaborators: [""],
  });

  const tagColors = {
    public: "rgba(239, 68, 68, 0.6)",
    sports: "rgba(34, 197, 94, 0.6)",
    meetings: "rgba(59, 130, 246, 0.6)",
    programme: "rgba(107, 114, 128, 0.6)",
    social: "rgba(250, 204, 21, 0.6)",
    department: "rgba(249, 115, 22, 0.6)",
    students: "rgba(236, 72, 153, 0.6)",
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCollaboratorChange = (index, value) => {
    const updated = [...form.collaborators];
    updated[index] = value;
    setForm({ ...form, collaborators: updated });
  };

  const addCollaborator = () =>
    setForm({ ...form, collaborators: [...form.collaborators, ""] });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tag) {
      alert("Please select a tag before creating the event!");
      return;
    }

    try {
      const fullDateTime = new Date(`${form.date}T${form.time}`);

      const res = await axios.post(`${API}/events`, {
        title: form.title,
        description: form.description,
        date: fullDateTime,
        media: form.media,
        tag: form.tag,
        color: tagColors[form.tag],
        collaborators: form.collaborators.filter((c) => c.trim() !== ""),
      });

      console.log("✅ Event created:", res.data);
      navigate("/calendar", { state: { eventId: res.data._id } });
    } catch (err) {
      console.error("❌ Create event error:", err);
      alert("Error creating event! Check console for details.");
    }
  };

  return (
    <div className="event-create-container">
      <div className="event-create-card">
        <div className="event-create-header">
          <h2>Create Event</h2>
          <button
            className="close-btn"
            onClick={() => navigate("/calendar")}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {/* Event title */}
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Event Description"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />

          {/* Date + Time */}
          <div className="event-date-time">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

          {/* Media URL */}
          <input
            type="text"
            name="media"
            placeholder="Media URL (optional)"
            value={form.media}
            onChange={handleChange}
          />

          {/* Tag Dropdown */}
          <label className="collab-label">Tag (required)</label>
          <select
            name="tag"
            value={form.tag}
            onChange={handleChange}
            required
            className="tag-dropdown"
          >
            <option value="">Select Tag</option>
            <option value="public">Public</option>
            <option value="sports">Sports</option>
            <option value="meetings">Meetings</option>
            <option value="programme">Programme</option>
            <option value="social">Social</option>
            <option value="department">Department</option>
            <option value="students">Students</option>
          </select>

          {/* Collaborators */}
          <label className="collab-label">Collaborators @</label>
          {form.collaborators.map((collab, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Collaborator ${idx + 1}`}
              value={collab}
              onChange={(e) => handleCollaboratorChange(idx, e.target.value)}
            />
          ))}
          <button
            type="button"
            onClick={addCollaborator}
            className="add-collab-btn"
          >
            + Add Collaborator
          </button>

          {/* Action Buttons (Create first, Cancel second) */}
          <div className="action-buttons-row">
            <button type="submit" className="create-btn">
              Create Event
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>

          {/* View Calendar Button */}
          <button
            type="button"
            onClick={() => navigate("/calendar")}
            className="view-calendar-btn"
          >
            View Calendar
          </button>
        </form>
      </div>
    </div>
  );
}
