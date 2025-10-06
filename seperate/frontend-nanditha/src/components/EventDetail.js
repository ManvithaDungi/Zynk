// src/components/EventDetail.js
import React, { useState, useEffect } from "react";
import "./EventDetail.css";

export default function EventDetail({ event, anchorRect, onClose, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.start ? event.start.toISOString().slice(0, 10) : "",
    media: event?.media || "",
    tag: event?.tag || "Public",
  });

  useEffect(() => {
    setForm({
      title: event?.title || "",
      description: event?.description || "",
      date: event?.start ? event.start.toISOString().slice(0, 10) : "",
      media: event?.media || "",
      tag: event?.tag || "Public",
    });
    setEditing(false);
  }, [event]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async () => {
    try {
      setLoading(true);
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        media: form.media,
        tag: form.tag,
      };
      await onUpdate(payload);
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update event. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  // compute a position based on anchorRect (falls back to center)
  const computeStyle = () => {
    const base = { position: "absolute", zIndex: 2000 };
    if (!anchorRect) {
      // center-right fallback
      base.right = "8%";
      base.top = "15%";
      return base;
    }

    // try position to the right of the event, with fallback that keeps inside viewport
    const padding = 12;
    const popupWidth = 360;
    const popupHeight = editing ? 420 : 220;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = anchorRect.right + padding;
    let top = anchorRect.top - popupHeight / 4;

    // if not enough space on right, position to left
    if (left + popupWidth > viewportW - 20) {
      left = anchorRect.left - popupWidth - padding;
    }

    // clamp top
    if (top + popupHeight > viewportH - 20) {
      top = viewportH - popupHeight - 20;
    }
    if (top < 20) top = 20;

    base.left = `${left}px`;
    base.top = `${top}px`;
    base.width = `${popupWidth}px`;

    return base;
  };

  return (
    <div className="event-detail" style={computeStyle()}>
      <div className="detail-card">
        <button className="close-x" onClick={onClose} aria-label="Close">✕</button>

        {!editing ? (
          <>
            <h3>{event.title}</h3>
            <p className="detail-date">{event.start?.toLocaleString()}</p>
            {event.description && <p className="detail-desc">{event.description}</p>}
            <p><strong>Tag:</strong> <span style={{ textTransform: "capitalize" }}>{event.tag || "Public"}</span></p>

            <div className="detail-actions">
              <button onClick={() => setEditing(true)} className="edit-btn">Edit</button>
              <button onClick={onDelete} className="delete-btn">Delete</button>
              <button onClick={() => (window.location.href = "/events")} className="view-btn">View Event</button>
            </div>
          </>
        ) : (
          <>
            <h3>Edit Event</h3>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Event title" />
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Event description" />
            <input type="date" name="date" value={form.date} onChange={handleChange} />
            <input name="media" value={form.media} onChange={handleChange} placeholder="Media URL (optional)" />

            <label htmlFor="tag" style={{ display: "block", marginTop: 8, marginBottom: 6 }}>
              <strong>Tag</strong>
            </label>
            <select name="tag" value={form.tag} onChange={handleChange} className="tag-select">
              <option value="Public">Public</option>
              <option value="Sports">Sports</option>
              <option value="Meetings">Meetings</option>
              <option value="Programme">Programme</option>
              <option value="Social">Social</option>
              <option value="Department">Department</option>
              <option value="Students">Students</option>
            </select>

            <div className="detail-actions" style={{ marginTop: 12 }}>
              <button onClick={submit} className="save-btn" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
              <button onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
