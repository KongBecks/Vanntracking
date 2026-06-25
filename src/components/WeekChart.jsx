import React, { useEffect, useState } from 'react';

const DAYS_NO = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];

export default function WeekChart({ goal }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('/api/history?days=7')
      .then(r => r.json())
      .then(data => setHistory(data.reverse()))
      .catch(() => {});
  }, []);

  if (history.length === 0) return null;

  const maxVal = Math.max(goal, ...history.map(d => d.total_ml));
  const goalPercent = (goal / maxVal) * 100;

  return (
    <div className="card week-chart">
      <h3>Siste 7 dager</h3>
      <div className="chart-bars" style={{ position: 'relative' }}>
        <div
          className="goal-line"
          style={{ bottom: `calc(${goalPercent}% + 24px)` }}
        >
          <span className="goal-line-label">{goal} ml</span>
        </div>
        {history.map((day, i) => {
          const d = new Date(day.date + 'T12:00:00');
          const dayName = DAYS_NO[d.getDay()];
          const isToday = i === history.length - 1;
          const heightPercent = maxVal > 0 ? (day.total_ml / maxVal) * 100 : 0;
          const goalMet = day.total_ml >= goal;

          return (
            <div className="chart-bar-wrapper" key={day.date}>
              <span className="chart-value">
                {day.total_ml > 0 ? `${(day.total_ml / 1000).toFixed(1)}L` : ''}
              </span>
              <div
                className={`chart-bar ${isToday ? 'today' : ''} ${goalMet ? 'goal-met' : ''}`}
                style={{ height: `${Math.max(heightPercent, 1)}%` }}
              />
              <span className="chart-label" style={{ fontWeight: isToday ? 700 : 400 }}>
                {isToday ? 'i dag' : dayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
