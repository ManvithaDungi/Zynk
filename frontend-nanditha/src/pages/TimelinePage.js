// src/pages/TimelinePage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useLocation } from "react-router-dom";
import "./TimelinePage.css";
import EventDetail from "../components/EventDetail";

const locales = { "en-US": require("date-fns/locale/en-US") };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

const API = process.env.REACT_APP_API || "http://localhost:5000/api";

export default function TimelinePage() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("month");
  const location = useLocation();
  const calendarRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/events`);
      const colorMap = {
        public: "rgba(239,68,68,0.6)",
        sports: "rgba(34,197,94,0.6)",
        meetings: "rgba(59,130,246,0.6)",
        programme: "rgba(107,114,128,0.6)",
        social: "rgba(234,179,8,0.6)",
        department: "rgba(249,115,22,0.6)",
        students: "rgba(236,72,153,0.6)",
      };

      const mapped = res.data.map((ev) => ({
        id: ev._id,
        title: ev.title,
        start: new Date(ev.date),
        end: new Date(ev.date),
        description: ev.description,
        media: ev.media,
        tag: ev.tag ? ev.tag.toLowerCase() : "public",
        color: colorMap[(ev.tag || "public").toLowerCase()] || "rgba(59,130,246,0.6)",
      }));

      setEvents(mapped);

      // if redirected from create
      const state = location.state;
      if (state?.eventId) {
        const found = mapped.find((m) => m.id === state.eventId);
        if (found) {
          setSelectedEvent(found);
          setCurrentDate(found.start);
        } else if (state?.date) {
          setCurrentDate(new Date(state.date));
        }
        window.history.replaceState({}, document.title);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }, [location.state]);

  useEffect(() => {
    fetchEvents();

    // populate sidebar date block
    try {
      const d = new Date();
      const numEl = document.getElementById("sidebar-date-number");
      const monthEl = document.getElementById("sidebar-date-month");
      const yearEl = document.getElementById("sidebar-date-year");
      if (numEl) numEl.innerText = d.getDate();
      if (monthEl) monthEl.innerText = d.toLocaleString("default", { month: "long" });
      if (yearEl) yearEl.innerText = d.getFullYear();
    } catch (e) {
      // safe fallback: ignore if DOM not present
    }
  }, [fetchEvents]);

  const handleNavigate = (date) => setCurrentDate(date);

  // onSelectEvent gets the synthetic click event as second parameter
  // we'll read boundingClientRect and pass to EventDetail for positioning
  const handleSelectEvent = (event, e) => {
    if (e && e.target) {
      const target = e.target.closest(".rbc-event") || e.target;
      const rect = target.getBoundingClientRect();
      setAnchorRect(rect);
    } else {
      setAnchorRect(null);
    }
    setSelectedEvent(event);
  };

  const handleViewChange = (newView) => setView(newView);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API}/events/${id}`);
      setSelectedEvent(null);
      setAnchorRect(null);
      fetchEvents();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed.");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await axios.put(`${API}/events/${id}`, updates);
      setSelectedEvent(null);
      setAnchorRect(null);
      fetchEvents();
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed.");
    }
  };

  const upcomingEvents = events
    .filter((e) => new Date(e.start) >= new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  return (
    <div className="calendar-layout" style={{ position: "relative" }}>
      <div className="calendar-main">
        <div className="calendar-header">
          <h2>Your Event Calendar</h2>
        </div>

        <div className="calendar-card" style={{ width: "100%", maxWidth: "1100px" }}>
          <Calendar
            ref={calendarRef}
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            style={{ height: "720px", width: "100%" }}
            eventPropGetter={(event) => ({
              style: {
                background: event.color,
                color: "white",
                borderRadius: "8px",
                padding: "6px 10px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                opacity: 0.95,
              },
            })}
            components={{
              event: ({ event }) => <div className="rbc-custom-event">{event.title}</div>,
            }}
          />
        </div>

        <div className="upcoming-box">
          <h3>Upcoming Events</h3>
          {upcomingEvents.length > 0 ? (
            <ul>
              {upcomingEvents.map((e) => (
                <li key={e.id} onClick={() => setCurrentDate(e.start)}>
                  <strong>{e.title}</strong>
                  <span>
                    {new Date(e.start).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events</p>
          )}
        </div>
      </div>

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          anchorRect={anchorRect}
          onClose={() => { setSelectedEvent(null); setAnchorRect(null); }}
          onDelete={() => handleDelete(selectedEvent.id)}
          onUpdate={(updates) => handleUpdate(selectedEvent.id, updates)}
        />
      )}
    </div>
  );
}
