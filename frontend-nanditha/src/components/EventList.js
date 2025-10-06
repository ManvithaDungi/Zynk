import React, { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "./EventCard";
import "./Timeline.css";

function EventList({ refresh }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };
    fetchEvents();
  }, [refresh]);

  return (
    <div className="event-list">
      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        events.map((event) => <EventCard key={event._id} event={event} />)
      )}
    </div>
  );
}

export default EventList;
