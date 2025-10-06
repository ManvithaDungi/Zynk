import React, { useState } from "react";
import axios from "axios";
import "./Timeline.css";

function EventForm({ onEventCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [files, setFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);

    Array.from(files).forEach((file) => {
      formData.append("media", file);
    });

    try {
      const token = localStorage.getItem("token"); // assumes auth system
      const res = await axios.post("/api/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      onEventCreated(res.data);
      setTitle("");
      setDescription("");
      setDate("");
      setFiles([]);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <h2>Create New Event</h2>
      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Event Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => setFiles(e.target.files)}
      />
      <button type="submit">Add Event</button>
    </form>
  );
}

export default EventForm;
