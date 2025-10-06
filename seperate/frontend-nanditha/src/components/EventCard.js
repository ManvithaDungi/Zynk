import React from "react";

function EventCard({ event }) {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p className="event-date">
        {new Date(event.date).toLocaleDateString()}
      </p>
      <div className="event-media">
        {event.media &&
          event.media.map((m, idx) =>
            m.type === "image" ? (
              <img key={idx} src={m.url} alt="event" />
            ) : (
              <video key={idx} controls>
                <source src={m.url} type="video/mp4" />
              </video>
            )
          )}
      </div>
    </div>
  );
}

export default EventCard;
