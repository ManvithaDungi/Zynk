// src/pages/History.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Timeline.css"; // reuse existing page styling

const API = process.env.REACT_APP_API || "http://localhost:5000/api";

export default function History() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`${API}/events`).then((res) => {
      // sort descending for most recent first
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(sorted);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="history-page">
      <div className="form-card" style={{background: "transparent", boxShadow: "none"}}>
        <h2 style={{color:"#2b2540"}}>Previously Created Events</h2>
        <p style={{color:"#3b3b50"}}>Browse through past events and plan you upcoming events accordingly!!</p>
        <hr />
        <div className="quicklist-section">
          <h3 style={{color:"#2b2540"}}>Quick List</h3>
          <ul style={{paddingLeft:"1.1rem"}}>
            {events.length === 0 ? (
              <li style={{color:"#666"}}>No past events</li>
            ) : events.map(ev => (
              <li key={ev._id} style={{marginBottom:"0.9rem"}}>
                <strong style={{display:"block", color:"#111"}}>{ev.title}</strong>
                <span style={{color:"#555"}}>{new Date(ev.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
