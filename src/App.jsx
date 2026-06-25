import React, { useEffect, useState } from 'react';
import WaterBottle from './components/WaterBottle';
import TapList from './components/TapList';
import WeekChart from './components/WeekChart';

const DEFAULT_GOAL = 2000;

export default function App() {
  const [data, setData] = useState(null);
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem('waterGoal');
    return saved ? parseInt(saved) : DEFAULT_GOAL;
  });
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);

  const justTapped = new URLSearchParams(window.location.search).has('tapped');

  useEffect(() => {
    if (justTapped) {
      setAnimate(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    fetch(`/api/today?goal=${goal}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [goal]);

  const handleGoalChange = (newGoal) => {
    setGoal(newGoal);
    localStorage.setItem('waterGoal', newGoal.toString());
  };

  if (loading) {
    return <div className="loading">Laster...</div>;
  }

  const percent = data ? (data.total_ml / goal) * 100 : 0;
  const goalReached = data && data.total_ml >= goal;

  return (
    <div className={justTapped ? 'tapped-flash' : ''}>
      <div className="header">
        <h1>Vanntracking</h1>
        <p>{new Date().toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="card bottle-section">
        <WaterBottle percent={percent} animate={animate} />
        <div className="stats">
          <div className="total">
            {data?.total_ml || 0} <span>/ {goal} ml</span>
          </div>
          <div className="subtitle">
            {data?.tap_count || 0} tap{data?.tap_count !== 1 ? '' : ''} i dag
          </div>
          {goalReached && (
            <div className="goal-reached">
              Dagsmålet er nådd!
            </div>
          )}
        </div>
      </div>

      <TapList entries={data?.entries} />

      <WeekChart goal={goal} />

      <div className="card settings-row">
        <label htmlFor="goal">Dagsmål</label>
        <select
          id="goal"
          value={goal}
          onChange={e => handleGoalChange(parseInt(e.target.value))}
        >
          <option value="1500">1500 ml</option>
          <option value="2000">2000 ml</option>
          <option value="2500">2500 ml</option>
          <option value="3000">3000 ml</option>
          <option value="3500">3500 ml</option>
          <option value="4000">4000 ml</option>
        </select>
      </div>
    </div>
  );
}
