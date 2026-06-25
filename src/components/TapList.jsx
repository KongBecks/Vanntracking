import React from 'react';

export default function TapList({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="card tap-list">
        <h3>Dagens tap</h3>
        <div className="empty-state">Ingen tap registrert i dag ennå</div>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('nb-NO', {
      timeZone: 'Europe/Oslo',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card tap-list">
      <h3>Dagens tap ({entries.length})</h3>
      {[...entries].reverse().map((entry, i) => (
        <div className="tap-entry" key={entry.id || i}>
          <span className="time">{formatTime(entry.timestamp)}</span>
          <span className="amount">+{entry.amount_ml} ml</span>
        </div>
      ))}
    </div>
  );
}
