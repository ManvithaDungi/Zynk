import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Tp.css";

const API = process.env.REACT_APP_API || "http://localhost:5000/api";

export default function Tp() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API}/events`);
        const sorted = res.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setEvents(sorted);
      } catch (err) {
        console.error("Timeline fetch error:", err);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="timeline-layout">
      <div className="timeline-wrapper">
        <div className="timeline-line" />
        <div className="timeline-scroll">
          {events.map((e, i) => (
            <div key={i} className="timeline-event">
              <div className="event-date">
                {new Date(e.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="event-card">
                <h3>{e.title}</h3>
                {e.description && <p>{e.description}</p>}
                {e.media && (
                  <div className="event-media">
                    <img src={e.media} alt="event media" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
