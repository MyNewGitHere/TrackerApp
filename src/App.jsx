import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import './App.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const workoutPlan = {
  WED: {
    name: 'Legs 1 + Lower Abs',
    exercises: [
      { name: 'Deadlifts', type: 'reps+weight' },
      { name: 'Leg Press (Wide stance)', type: 'reps+weight' },
      { name: 'Dumbbell Lunges', type: 'reps+weight' },
      { name: 'Barbell Hip Thrusts', type: 'reps+weight' },
      { name: 'Standing Calf Raises', type: 'reps+weight' },
      { name: 'Hanging Leg Raises', type: 'reps' },
      { name: 'Decline Reverse Crunch (Reach Up)', type: 'reps' },
      { name: 'Cable Reverse Crunch', type: 'reps+weight' },
      { name: 'Ab Wheel Rollouts / Slow Mountain Climbers', type: 'reps+weight' },
    ],
  },
  THU: {
    name: 'Push (Chest + Shoulders + Triceps)',
    exercises: [
      { name: 'Flat Barbell Bench Press', type: 'reps+weight' },
      { name: 'Incline DB Press', type: 'reps+weight' },
      { name: 'DB Lateral Raise + Front Plate Raise', type: 'reps+weight' },
      { name: 'Cable Chest Fly', type: 'reps+weight' },
      { name: 'Rope Triceps Pushdown', type: 'reps+weight' },
      { name: 'Overhead DB Triceps Extension', type: 'reps+weight' },
    ],
  },
  FRI: {
    name: 'Pull (Back + Rear Delts + Biceps)',
    exercises: [
      { name: 'Close-Grip Lat Pulldown', type: 'reps+weight' },
      { name: 'T-Bar Row', type: 'reps+weight' },
      { name: 'DB One-Arm Row / Seated Row', type: 'reps+weight' },
      { name: 'Rope Face Pulls', type: 'reps' },
      { name: 'Barbell Curl', type: 'reps+weight' },
      { name: 'Hammer Curl', type: 'reps+weight' },
    ],
  },
  SAT: {
    name: 'Legs 2 (Quads + Hams + Calves)',
    exercises: [
      { name: 'Barbell Squats', type: 'reps+weight' },
      { name: 'Bulgarian Split Squats', type: 'reps+weight' },
      { name: 'Lying Hamstring Curl', type: 'reps+weight' },
      { name: 'Goblet Sumo Squats', type: 'reps+weight' },
      { name: 'Seated Calf Raises', type: 'reps+weight' },
    ],
  },
  SUN: {
    name: 'Arms + Abs',
    exercises: [
      { name: 'Weighted Decline Sit-Ups', type: 'reps+weight' },
      { name: 'Cable Woodchopper', type: 'reps+weight' },
      { name: 'Weighted Hanging Knee Raises', type: 'reps+weight' },
      { name: 'V-Ups to Twist', type: 'reps' },
      { name: 'Incline Dumbbell Curl', type: 'reps+weight' },
      { name: 'EZ Bar or Barbell Curl', type: 'reps+weight' },
      { name: 'Hammer Curl', type: 'reps+weight' },
      { name: 'Skullcrusher', type: 'reps+weight' },
      { name: 'Overhead Rope or DB Triceps Extension', type: 'reps+weight' },
      { name: 'Dumbbell Kickbacks', type: 'reps+weight' },
    ],
  },
}

const days = ['WED', 'THU', 'FRI', 'SAT', 'SUN']
const dayNames = { WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' }

function getCurrentWeekKey() {
  const now = new Date()
  const year = now.getFullYear()
  // Get ISO week number
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const daysOffset = (now - jan1) / 86400000 + jan1.getDay() + 1
  const week = Math.ceil(daysOffset / 7)
  return `${year}-W${week}`
}

const statFields = [
  { key: 'weight', label: 'Weight (kg)', hint: 'Normal: 60-90 kg', icon: '🏋️' },
  { key: 'arm', label: 'Arm Size (in)', hint: 'Normal: 13-15 in', icon: '💪' },
  { key: 'chest', label: 'Chest Size (in)', hint: 'Normal: 38-42 in', icon: '🦺' },
  { key: 'leg', label: 'Leg Size (in)', hint: 'Normal: 21-23 in', icon: '🦵' },
  { key: 'calf', label: 'Calf Size (in)', hint: 'Normal: 14-16 in', icon: '🦶' },
]

function App() {
  const [selectedDay, setSelectedDay] = useState(days[0])
  const [showHistory, setShowHistory] = useState(false)
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('systemProgress')
    return saved ? JSON.parse(saved) : {}
  })
  const [editing, setEditing] = useState({}) // { [day]: { [quest]: idx } }
  const weekKey = getCurrentWeekKey()
  const [showProfile, setShowProfile] = useState(false)
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '')
  const [height, setHeight] = useState(() => localStorage.getItem('playerHeight') || '')
  const [statInputs, setStatInputs] = useState(() => {
    const saved = localStorage.getItem('playerStatsCurrent')
    return saved ? JSON.parse(saved) : { weight: '', arm: '', chest: '', leg: '', calf: '' }
  })
  const [statHistory, setStatHistory] = useState(() => {
    const saved = localStorage.getItem('playerStatsHistory')
    return saved ? JSON.parse(saved) : []
  })
  const [showPastRecords, setShowPastRecords] = useState(false)
  const [selectedPastDay, setSelectedPastDay] = useState(days[0])
  const [selectedPastQuest, setSelectedPastQuest] = useState('')
  const [activeTab, setActiveTab] = useState('quests') // 'quests', 'archive', 'status'

  useEffect(() => {
    localStorage.setItem('systemProgress', JSON.stringify(progress))
  }, [progress])

  // Save name/height to localStorage
  useEffect(() => {
    localStorage.setItem('playerName', playerName)
  }, [playerName])
  useEffect(() => {
    localStorage.setItem('playerHeight', height)
  }, [height])

  // Save stat inputs
  useEffect(() => {
    localStorage.setItem('playerStatsCurrent', JSON.stringify(statInputs))
  }, [statInputs])

  // Save stat history
  useEffect(() => {
    localStorage.setItem('playerStatsHistory', JSON.stringify(statHistory))
  }, [statHistory])

  // Add a new attempt for a quest (unlogged)
  const addAttempt = (day, quest) => {
    setProgress(prev => {
      const weekData = prev[weekKey] || {}
      const dayData = weekData[day] || {}
      const questAttempts = dayData[quest] || []
      return {
        ...prev,
        [weekKey]: {
          ...weekData,
          [day]: {
            ...dayData,
            [quest]: [...questAttempts, { reps: '', weight: '', complete: false }],
          },
        },
      }
    })
    setEditing(prev => ({ ...prev, [day]: { ...(prev[day] || {}), [quest]: (progress[weekKey]?.[day]?.[quest]?.length || 0) } }))
  }

  // Update an attempt's reps or weight (while editing)
  const updateAttempt = (day, quest, idx, field, value) => {
    setProgress(prev => {
      const weekData = prev[weekKey] || {}
      const dayData = weekData[day] || {}
      const questAttempts = dayData[quest] || []
      const updatedAttempts = questAttempts.map((att, i) =>
        i === idx ? { ...att, [field]: value } : att
      )
      return {
        ...prev,
        [weekKey]: {
          ...weekData,
          [day]: {
            ...dayData,
            [quest]: updatedAttempts,
          },
        },
      }
    })
  }

  // Log (complete) an attempt
  const logAttempt = (day, quest, idx) => {
    setProgress(prev => {
      const weekData = prev[weekKey] || {}
      const dayData = weekData[day] || {}
      const questAttempts = dayData[quest] || []
      const updatedAttempts = questAttempts.map((att, i) =>
        i === idx ? { ...att, complete: true } : att
      )
      return {
        ...prev,
        [weekKey]: {
          ...weekData,
          [day]: {
            ...dayData,
            [quest]: updatedAttempts,
          },
        },
      }
    })
    setEditing(prev => ({ ...prev, [day]: { ...(prev[day] || {}), [quest]: undefined } }))
  }

  // Edit a completed attempt
  const editAttempt = (day, quest, idx) => {
    setEditing(prev => ({ ...prev, [day]: { ...(prev[day] || {}), [quest]: idx } }))
  }

  // Save an edited attempt
  const saveAttempt = (day, quest, idx) => {
    setProgress(prev => {
      const weekData = prev[weekKey] || {}
      const dayData = weekData[day] || {}
      const questAttempts = dayData[quest] || []
      const updatedAttempts = questAttempts.map((att, i) =>
        i === idx ? { ...att, complete: true } : att
      )
      return {
        ...prev,
        [weekKey]: {
          ...weekData,
          [day]: {
            ...dayData,
            [quest]: updatedAttempts,
          },
        },
      }
    })
    setEditing(prev => ({ ...prev, [day]: { ...(prev[day] || {}), [quest]: undefined } }))
  }

  // Delete an attempt
  const deleteAttempt = (day, quest, idx) => {
    setProgress(prev => {
      const weekData = prev[weekKey] || {}
      const dayData = weekData[day] || {}
      const questAttempts = dayData[quest] || []
      const updatedAttempts = questAttempts.filter((_, i) => i !== idx)
      return {
        ...prev,
        [weekKey]: {
          ...weekData,
          [day]: {
            ...dayData,
            [quest]: updatedAttempts,
          },
        },
      }
    })
    setEditing(prev => {
      const newEdit = { ...prev }
      if (newEdit[day]?.[quest] === idx) {
        newEdit[day][quest] = undefined
      }
      return newEdit
    })
  }

  // Get attempts for current week/day/quest
  const getAttempts = (day, quest) =>
    progress[weekKey]?.[day]?.[quest] || []

  // Get past records for selected day (all previous weeks)
  const getPastRecords = (day, quest) => {
    const records = []
    Object.keys(progress).forEach(key => {
      if (key !== weekKey && progress[key]?.[day]?.[quest]) {
        records.push({ week: key, attempts: progress[key][day][quest] })
      }
    })
    return records
  }

  // Log current stats to history
  const logStats = () => {
    const entry = {
      ...statInputs,
      date: new Date().toISOString(),
    }
    setStatHistory(prev => [...prev, entry])
  }

  // Prepare chart data for a stat
  const getChartData = (key, label) => {
    const data = statHistory.filter(e => e[key]).map(e => ({
      value: Number(e[key]),
      date: new Date(e.date).toLocaleDateString(),
    }))
    return {
      labels: data.map(d => d.date),
      datasets: [
        {
          label,
          data: data.map(d => d.value),
          borderColor: '#00eaff',
          backgroundColor: 'rgba(0,234,255,0.2)',
          tension: 0.3,
        },
      ],
    }
  }

  // Get all week keys sorted (excluding current week)
  const getPastWeekKeys = () => {
    return Object.keys(progress)
      .filter(k => k !== weekKey)
      .sort((a, b) => (a < b ? 1 : -1))
  }

  // Get week label (e.g., 'Last Week', 'Second Last Week', '2024-W23')
  const getWeekLabel = (weekIdx, weekKey) => {
    if (weekIdx === 0) return 'Last Week'
    if (weekIdx === 1) return 'Second Last Week'
    if (weekIdx === 3) return 'Third Last Week'
    return weekKey
  }

  return (
    <div className="workout-app">
      {/* Bottom Navigation Bar */}
      <div className="system-bottom-nav">
        <button
          className={activeTab === 'quests' ? 'active' : ''}
          onClick={() => setActiveTab('quests')}
        >
          <span className="system-nav-icon">🗡️</span>
          Quests
        </button>
        <button
          className={activeTab === 'archive' ? 'active' : ''}
          onClick={() => setActiveTab('archive')}
        >
          <span className="system-nav-icon">📜</span>
          Archive
        </button>
        <button
          className={activeTab === 'status' ? 'active' : ''}
          onClick={() => setActiveTab('status')}
        >
          <span className="system-nav-icon">🧬</span>
          Status
        </button>
      </div>

      {/* Quests Tab */}
      {activeTab === 'quests' && (
        <>
          <h1>Level Up System</h1>
          <div className="day-selector">
            {days.map(day => (
              <button
                key={day}
                className={selectedDay === day ? 'active' : ''}
                onClick={() => setSelectedDay(day)}
              >
                {dayNames[day]}
              </button>
            ))}
          </div>
          <h2>Quest Day: {workoutPlan[selectedDay].name}</h2>
          <button style={{margin:'0 auto 24px auto',display:'block'}} onClick={()=>setShowHistory(h=>!h)}>
            {showHistory ? 'Hide Past Records' : 'View Past Records'}
          </button>
          <ul>
            {workoutPlan[selectedDay].exercises.map(questObj => {
              const quest = questObj.name;
              const type = questObj.type;
              return (
                <li key={quest}>
                  <div className="exercise-card">
                    <div><b>Quest: {quest}</b></div>
                    <button onClick={() => addAttempt(selectedDay, quest)}>Log Attempt</button>
                    <div className="set-list">
                      {getAttempts(selectedDay, quest).length === 0 && <span>No attempts yet.</span>}
                      <ul>
                        {getAttempts(selectedDay, quest).map((att, idx) => {
                          const isEditing = editing[selectedDay]?.[quest] === idx;
                          // Render input fields based on type
                          const inputFields = (
                            <>
                              {(type === 'reps' || type === 'reps+weight' || type === 'reps+time') && (
                                <>
                                  Reps: <input
                                    type="number"
                                    min="0"
                                    value={att.reps}
                                    onChange={e => updateAttempt(selectedDay, quest, idx, 'reps', e.target.value)}
                                  />
                                </>
                              )}
                              {(type === 'reps+weight' || type === 'time' || type === 'reps+time') && (
                                <>
                                  {type === 'time' || type === 'reps+time' ? 'Time (sec):' : 'Weight:'} <input
                                    type="number"
                                    min="0"
                                    value={type === 'time' || type === 'reps+time' ? att.time || '' : att.weight}
                                    onChange={e => updateAttempt(selectedDay, quest, idx, type === 'time' || type === 'reps+time' ? 'time' : 'weight', e.target.value)}
                                  />
                                </>
                              )}
                            </>
                          );
                          // Validation for log/save button
                          let canLog = false;
                          if (type === 'reps') canLog = !!att.reps;
                          if (type === 'reps+weight') canLog = !!att.reps && !!att.weight;
                          if (type === 'time') canLog = !!att.time;
                          if (type === 'reps+time') canLog = !!att.reps && !!att.time;
                          // Log display
                          let logText = '';
                          if (type === 'reps') logText = `[Reps: ${att.reps}]`;
                          if (type === 'reps+weight') logText = `[Reps: ${att.reps}, Weight: ${att.weight}kg]`;
                          if (type === 'time') logText = `[Time: ${att.time}s]`;
                          if (type === 'reps+time') logText = `[Reps: ${att.reps}, Time: ${att.time}s]`;
                          if (!att.complete || isEditing) {
                            return (
                              <li key={idx} style={{background:'rgba(0,234,255,0.04)',borderRadius:'8px',padding:'4px 8px'}}>
                                Attempt {idx + 1}:
                                {inputFields}
                                {isEditing ? (
                                  <>
                                    <button style={{marginLeft:8}} onClick={() => saveAttempt(selectedDay, quest, idx)} disabled={!canLog}>Save</button>
                                    <button style={{marginLeft:8}} onClick={() => deleteAttempt(selectedDay, quest, idx)}>Erase Log</button>
                                  </>
                                ) : (
                                  <>
                                    <button style={{marginLeft:8}} onClick={() => logAttempt(selectedDay, quest, idx)} disabled={!canLog}>Log</button>
                                    <button style={{marginLeft:8}} onClick={() => deleteAttempt(selectedDay, quest, idx)}>Erase Log</button>
                                  </>
                                )}
                              </li>
                            )
                          } else {
                            return (
                              <li key={idx} style={{background:'rgba(0,234,255,0.12)',borderRadius:'8px',boxShadow:'0 0 8px #00eaff77',padding:'4px 8px'}}>
                                Attempt {idx + 1}:
                                <span style={{color:'#00eaff',marginLeft:8}}>
                                  {logText} <span style={{fontWeight:700,marginLeft:8}}>✔</span>
                                </span>
                                <button style={{marginLeft:12}} onClick={() => editAttempt(selectedDay, quest, idx)}>Recalibrate</button>
                                <button style={{marginLeft:8}} onClick={() => deleteAttempt(selectedDay, quest, idx)}>Erase Log</button>
                              </li>
                            )
                          }
                        })}
                      </ul>
                    </div>
                    {/* Past records for this quest (quick view) */}
                    <div style={{marginTop:'12px'}}>
                      <b style={{color:'#00eaff'}}>Past Records:</b>
                      {getPastRecords(selectedDay, quest).length === 0 ? (
                        <div style={{color:'#aaa'}}>No past records.</div>
                      ) : (
                        <ul>
                          {getPastRecords(selectedDay, quest).map((rec, i) => (
                            <li key={i} style={{fontSize:'0.95em',marginBottom:'4px'}}>
                              <span style={{color:'#00eaff'}}>{rec.week}:</span> {rec.attempts.map((a, j) => {
                                if (!a.complete) return '';
                                if (type === 'reps') return `[${a.reps} reps]`;
                                if (type === 'reps+weight') return `[${a.reps} reps, ${a.weight}kg]`;
                                if (type === 'time') return `[${a.time}s]`;
                                if (type === 'reps+time') return `[${a.reps} reps, ${a.time}s]`;
                                return '';
                              }).join(' ')}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {/* Archive Tab */}
      {activeTab === 'archive' && (
        <div className="system-archive-page">
          <h2 className="system-title">[System Archive]</h2>
          <div className="system-field">
            <label><span className="system-label-icon">📅</span>Quest Day</label>
            <select
              value={selectedPastDay}
              onChange={e => {
                setSelectedPastDay(e.target.value)
                setSelectedPastQuest('')
              }}
              style={{width:'160px'}}
            >
              {days.map(day => (
                <option key={day} value={day}>{dayNames[day]}</option>
              ))}
            </select>
          </div>
          <div className="system-field">
            <label><span className="system-label-icon">🎯</span>Quest</label>
            <select
              value={selectedPastQuest}
              onChange={e => setSelectedPastQuest(e.target.value)}
              style={{width:'220px'}}
            >
              <option value="">-- Select Quest --</option>
              {workoutPlan[selectedPastDay].exercises.map(q => (
                <option key={q.name} value={q.name}>{q.name}</option>
              ))}
            </select>
          </div>
          {selectedPastQuest && (
            <div style={{marginTop:18}}>
              <b style={{color:'#00eaff',fontSize:'1.18rem',letterSpacing:'1.2px'}}>All Past Records for {selectedPastQuest}:</b>
              <div style={{marginTop:10}}>
                {getPastWeekKeys().length === 0 ? (
                  <div className="system-message">No past records found for this quest.<br/>Complete a quest to see your progress here!</div>
                ) : (
                  getPastWeekKeys().map((wk, idx) => {
                    const weekData = progress[wk]?.[selectedPastDay]?.[selectedPastQuest] || []
                    if (!weekData.length) return null
                    // Find quest type
                    const questType = (workoutPlan[selectedPastDay].exercises.find(q => q.name === selectedPastQuest) || {}).type
                    return (
                      <div key={wk} style={{marginBottom:18}}>
                        <div style={{color:'#00eaff',marginBottom:4,fontWeight:600,fontSize:'1.08rem'}}>{getWeekLabel(idx, wk)}</div>
                        <table className="system-table">
                          <thead>
                            <tr style={{color:'#00eaff'}}>
                              <th>Set</th>
                              {questType === 'reps' && <th>Reps</th>}
                              {questType === 'reps+weight' && <><th>Reps</th><th>Weight (kg)</th></>}
                              {questType === 'time' && <th>Time (s)</th>}
                              {questType === 'reps+time' && <><th>Reps</th><th>Time (s)</th></>}
                            </tr>
                          </thead>
                          <tbody>
                            {weekData.filter(a=>a.complete).map((a, i) => (
                              <tr key={i}>
                                <td>{i+1}</td>
                                {questType === 'reps' && <td>{a.reps}</td>}
                                {questType === 'reps+weight' && <><td>{a.reps}</td><td>{a.weight}</td></>}
                                {questType === 'time' && <td>{a.time}</td>}
                                {questType === 'reps+time' && <><td>{a.reps}</td><td>{a.time}</td></>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div className="system-status-page">
          <h2 className="system-title">[Player Status Window]</h2>
          <div className="system-field">
            <label>Player Name</label>
            <input type="text" value={playerName} onChange={e=>setPlayerName(e.target.value)} />
          </div>
          <div className="system-field">
            <label>Height (cm)</label>
            <input type="number" value={height} onChange={e=>setHeight(e.target.value)} />
          </div>
          <hr className="system-hr" />
          {statFields.map(f => (
            <div className="system-field" key={f.key}>
              <label>{f.label}</label>
              <input
                type="number"
                step={f.key === 'weight' ? '0.1' : '0.1'}
                value={statInputs[f.key]}
                onChange={e => setStatInputs(s => ({ ...s, [f.key]: e.target.value }))}
              />
              <span style={{color:'#00eaff99', fontSize:'0.95em', marginLeft:8}}>{f.hint}</span>
            </div>
          ))}
          <button className="system-btn" style={{marginTop:12}} onClick={logStats}>
            Log Stats
          </button>
          <div className="system-graphs">
            {statFields.map(f => (
              <div key={f.key} className="system-graph-card">
                <div className="system-graph-title">
                  <span className="system-graph-icon">{f.icon}</span>
                  {f.label} Progress
                </div>
                <Line
                  data={getChartData(f.key, f.label)}
                  options={{
                    responsive: true,
                    animation: {
                      duration: 1200,
                      easing: 'easeInOutQuart',
                    },
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                      tooltip: {
                        backgroundColor: '#0f2027',
                        titleColor: '#00eaff',
                        bodyColor: '#e0f7fa',
                        borderColor: '#00eaff',
                        borderWidth: 1.5,
                      },
                    },
                    scales: {
                      x: {
                        ticks: { color: '#00eaff' },
                        grid: { color: 'rgba(0,234,255,0.1)' },
                      },
                      y: {
                        ticks: { color: '#00eaff' },
                        grid: { color: 'rgba(0,234,255,0.1)' },
                      },
                    },
                  }}
                  height={180}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
