import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const workerName = localStorage.getItem("worker_name");
  const workerId = localStorage.getItem("worker_id");

  // --- UI STATE ---
  const [viewMode, setViewMode] = useState("clock"); // 'clock' | 'tasks'

  // --- DATA STATE ---
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);
  
  // 🟢 We will split the data into two separate lists
  const [myLogs, setMyLogs] = useState([]);      // Only 'Utilization' (Work done)
  const [myTasks, setMyTasks] = useState([]);    // Only 'Assignment' (To do)

  // --- TIMER STATE ---
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [startTime, setStartTime] = useState(null);
  const [displayStartTime, setDisplayStartTime] = useState("");

  const [form, setForm] = useState({
    proposal_id: "",
    project_name: "",
    machine_name: "", 
    work_description: "", 
    date: new Date().toISOString().split('T')[0]
  });

  // 1. FETCH DATA & SEPARATE ASSIGNMENTS FROM LOGS
  const fetchData = useCallback(async () => {
    if (!workerId) return;
    try {
        // A. Dropdowns
        const projRes = await axios.get("http://127.0.0.1:5000/api/worker/projects");
        setProjects(projRes.data);

        const machRes = await axios.get("http://127.0.0.1:5000/api/common/machines");
        setMachines(machRes.data);

        // B. Fetch All Records (Logs + Assignments mixed)
        // We use the one endpoint we KNOW works: /api/worker/tasks/
        const allRecordsRes = await axios.get(`http://127.0.0.1:5000/api/worker/tasks/${workerId}`);
        const allData = allRecordsRes.data;

        // 🟢 FILTER LOGIC: SPLIT THE DATA HERE
        // 1. History Log (Only show 'Utilization')
        const historyLogs = allData.filter(item => item.type === 'Utilization');
        setMyLogs(historyLogs);

        // 2. Task Board (Only show 'Assignment')
        const assignedTasks = allData.filter(item => item.type === 'Assignment');
        setMyTasks(assignedTasks);

        // C. Check Active Session (Timer Logic)
        // We look for an active session only within Utilizations
        const currentWork = historyLogs.find(log => log.status === 'Active');
        if (currentWork && currentWork.start_timestamp) {
            setIsActive(true);
            setStartTime(currentWork.start_timestamp);
            const formattedTime = new Date(currentWork.start_timestamp).toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
            setDisplayStartTime(formattedTime);
            setForm(f => ({
                ...f, 
                machine_name: currentWork.machines, 
                project_name: currentWork.title,
                proposal_id: currentWork.id
            }));
        } else {
            setIsActive(false);
            setDisplayStartTime("");
        }
    } catch (err) {
        console.error("Fetch Error:", err);
    }
  }, [workerId]);

  useEffect(() => {
    if (!localStorage.getItem("worker_auth")) {
        navigate("/login/worker");
    } else {
        fetchData();
    }
  }, [navigate, fetchData]);

  // 2. REAL-TIME CLOCK
  useEffect(() => {
    let interval = null;
    if (isActive && startTime) {
      interval = setInterval(() => {
        const diff = new Date().getTime() - new Date(startTime).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      setElapsedTime("00:00:00");
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // 3. HANDLERS
  const handleStartWork = async (e) => {
    e.preventDefault();
    if (!form.proposal_id || !form.work_description) return alert("Fill all fields");
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/worker/log_machine", { ...form, worker_id: workerId, worker_name: workerName });
      if(res.data.success) { alert("🚀 Punch-In Successful!"); fetchData(); }
    } catch (err) { alert("Error starting session"); }
  };

  const handleEndWork = async () => {
    try {
        const res = await axios.post("http://127.0.0.1:5000/api/worker/end_session", { worker_id: workerId });
        if(res.data.success) { alert(`✅ Ended! Hours: ${res.data.hours}`); setForm({...form, work_description: ""}); fetchData(); }
    } catch (err) { alert("Error ending session"); }
  };

  const handleTaskComplete = async (taskId) => {
    if(!window.confirm("Mark this task as completed?")) return;
    try {
        await axios.put(`http://127.0.0.1:5000/api/worker/update-task/${taskId}`, { status: "Completed" });
        alert("Task Updated!");
        fetchData(); // Refresh list
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div style={styles.container}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>👷 Worker Portal</h2>
        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
            <span style={{color: '#FFAB40', fontWeight: 'bold'}}>Welcome, {workerName}</span>
            <button onClick={() => { localStorage.clear(); navigate("/"); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* SLIDER / TOGGLE SWITCH */}
      <div style={styles.toggleContainer}>
          <div style={styles.toggleBg}>
              <motion.div 
                layout 
                style={{
                    ...styles.activePill, 
                    left: viewMode === 'clock' ? '4px' : '50%' 
                }} 
              />
              <button onClick={() => setViewMode('clock')} style={{...styles.toggleBtn, color: viewMode === 'clock' ? 'white' : '#888'}}>
                 ⏰ Time Clock
              </button>
              <button onClick={() => setViewMode('tasks')} style={{...styles.toggleBtn, color: viewMode === 'tasks' ? 'white' : '#888'}}>
                 📋 My Assigned Tasks
              </button>
          </div>
      </div>

      <div style={styles.mainLayout}>
        <AnimatePresence mode="wait">
            
            {/* VIEW 1: TIME CLOCK & HISTORY LOG */}
            {viewMode === 'clock' && (
                <motion.div 
                    key="clock"
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    style={{display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center'}}
                >
                    {/* LOGGING FORM */}
                    <div style={styles.card}>
                        <h2 style={styles.title}>{isActive ? "⚡ Session Active" : "Log Machine Utilization"}</h2>
                        
                        {isActive && (
                            <div style={styles.timerDisplay}>
                                <div style={styles.punchInRow}><span>PUNCHED IN AT:</span><span style={styles.timeHighlight}>{displayStartTime}</span></div>
                                <div style={styles.divider}></div>
                                <div style={{fontSize: '11px', color: '#FFAB40', marginBottom: '5px'}}>TIME ELAPSED</div>
                                <div style={styles.timerText}>{elapsedTime}</div>
                            </div>
                        )}

                        <form onSubmit={handleStartWork} style={styles.form}>
                            <label style={styles.label}>Select Project</label>
                            <select style={styles.input} disabled={isActive} value={form.proposal_id} 
                                onChange={(e) => {
                                    const proj = projects.find(p => p.proposal_id.toString() === e.target.value);
                                    setForm({...form, proposal_id: e.target.value, project_name: proj?.project_name || ""});
                                }} required>
                                <option value="">-- Choose Project --</option>
                                {projects.map(p => <option key={p.proposal_id} value={p.proposal_id}>{p.project_name}</option>)}
                            </select>

                            <label style={styles.label}>Select Machine</label>
                            <select style={styles.input} disabled={isActive} value={form.machine_name} onChange={e => setForm({...form, machine_name: e.target.value})}>
                                {machines.map((m, i) => <option key={i} value={m}>{m}</option>)}
                            </select>

                            <label style={styles.label}>Work Description</label>
                            <textarea style={{...styles.input, height: '70px', resize: 'none'}} placeholder="What are you working on?" disabled={isActive} value={form.work_description} onChange={e => setForm({...form, work_description: e.target.value})} required />

                            <label style={styles.label}>Date</label>
                            <input type="date" style={styles.input} disabled={isActive} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />

                            {isActive ? (
                                <button type="button" onClick={handleEndWork} style={styles.stopBtn}>Stop & Finish Work 🏁</button>
                            ) : (
                                <button type="submit" style={styles.startBtn}>Punch In / Start Work 🛠️</button>
                            )}
                        </form>
                    </div>

                    {/* HISTORY LIST - NOW ONLY SHOWS 'UTILIZATION' */}
                    <div style={styles.summarySection}>
                        <h3 style={{color: '#FFAB40', marginBottom: '15px'}}>Your Log History</h3>
                        <div style={styles.listContainer}>
                            {myLogs.length > 0 ? (
                                myLogs.map((log, index) => (
                                    <motion.div key={index} style={styles.summaryCard}>
                                        <div style={styles.badge}>{log.type}</div>
                                        <h4 style={{margin: '10px 0 5px 0', color: '#FFAB40'}}>{log.title || log.project_name}</h4>
                                        <p style={{fontSize: '13px', color: '#ddd', fontStyle:'italic'}}>"{log.description || log.work_description || log.work}"</p>
                                        <p style={styles.logText}>🔧 {log.machines || log.machine} | ⏱️ {log.status === 'Active' ? 'In Progress' : `${log.hours || 0} Hours`}</p>
                                        <p style={{fontSize: '11px', color: '#888'}}>{log.date || log.start_date}</p>
                                    </motion.div>
                                ))
                            ) : <div style={styles.emptyState}>No work sessions logged yet.</div>}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* VIEW 2: TASK BOARD - NOW ONLY SHOWS 'ASSIGNMENT' */}
            {viewMode === 'tasks' && (
                <motion.div 
                    key="tasks"
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    style={{width: '100%', maxWidth: '1000px'}}
                >
                    <div style={styles.cardFull}>
                        <h3 style={styles.title}>📋 Tasks Assigned to Me</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.headerRow}>
                                    <th>Project</th><th>Machine</th><th>Task</th><th>Due Date</th><th>Status</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myTasks.length === 0 ? (
                                    <tr><td colSpan="6" style={{padding:'20px', textAlign:'center', color: '#666'}}>No tasks assigned yet.</td></tr>
                                ) : (
                                    myTasks.map(t => (
                                        <tr key={t.id} style={styles.row}>
                                            <td style={styles.td}>{t.title || t.project_name || "Project #" + t.proposal_id}</td>
                                            <td style={styles.td}><span style={{color:'#7C4DFF'}}>{t.machine || t.machines}</span></td>
                                            <td style={styles.td}>{t.work || t.description}</td>
                                            <td style={styles.td}>{t.end_date}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.statusBadge, 
                                                    color: t.status === 'Completed' ? '#00E676' : '#E040FB',
                                                    borderColor: t.status === 'Completed' ? '#00E676' : '#E040FB'
                                                }}>{t.status}</span>
                                            </td>
                                            <td style={styles.td}>
                                                {t.status !== "Completed" && (
                                                    <button onClick={() => handleTaskComplete(t.id)} style={styles.actionBtn}>Mark Done ✓</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#0f0f0f", color: 'white', fontFamily: 'sans-serif' },
  navbar: { display: "flex", justifyContent: "space-between", padding: "15px 40px", background: "#1a1a1a", borderBottom: "2px solid #FFAB40" },
  logo: { color: "white", margin: 0 },
  logoutBtn: { padding: "8px 18px", background: "#D32F2F", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  
  // TOGGLE SLIDER STYLES
  toggleContainer: { display: 'flex', justifyContent: 'center', marginTop: '30px' },
  toggleBg: { position: 'relative', display: 'flex', background: '#222', borderRadius: '30px', padding: '4px', border: '1px solid #444', width: '400px', height: '50px' },
  activePill: { position: 'absolute', top: '4px', bottom: '4px', width: '50%', background: '#FFAB40', borderRadius: '25px', zIndex: 0 },
  toggleBtn: { flex: 1, background: 'none', border: 'none', zIndex: 1, cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'color 0.3s' },

  mainLayout: { display: "flex", justifyContent: "center", padding: "40px 20px" },
  
  card: { background: "#1e1e1e", padding: "35px", borderRadius: "15px", width: "450px", border: "1px solid #333" },
  cardFull: { background: "#1e1e1e", padding: "35px", borderRadius: "15px", width: "100%", border: "1px solid #333" },
  
  title: { color: "#FFAB40", marginBottom: "25px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { color: "#888", fontSize: "11px", fontWeight: 'bold', textTransform: 'uppercase' },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "#2a2a2a", color: "white", outline: 'none' },

  // Timer
  timerDisplay: { background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #FFAB40', marginBottom: '25px', textAlign: 'center' },
  punchInRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' },
  timeHighlight: { color: 'white', fontWeight: 'bold' },
  divider: { height: '1px', background: '#333', margin: '12px 0' },
  timerText: { fontSize: '42px', fontFamily: 'monospace', fontWeight: 'bold', color: 'white', letterSpacing: '2px' },
  
  startBtn: { padding: "15px", background: "#FFAB40", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  stopBtn: { padding: "15px", background: "#D32F2F", color: 'white', border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },

  // Summary / History List
  summarySection: { flex: 1, minWidth: '350px', maxWidth: '550px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '650px', overflowY: 'auto' },
  summaryCard: { background: '#1e1e1e', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #FFAB40' },
  badge: { width: 'fit-content', padding: '2px 8px', borderRadius: '4px', background: '#333', fontSize: '10px', color: '#FFAB40' },
  logText: { fontSize: '13px', margin: '4px 0', color: '#bbb' },
  emptyState: { padding: '20px', background: '#161616', borderRadius: '10px', border: '1px dashed #333', textAlign: 'center', color: '#666' },

  // Table Styles (Task Board)
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px", color: "white", marginTop: '20px' },
  headerRow: { background: "rgba(255,255,255,0.05)", textAlign: "left" },
  row: { borderBottom: "1px solid #333" },
  td: { padding: "15px" },
  statusBadge: { padding: "5px 10px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", border: "1px solid" },
  actionBtn: { padding: "6px 12px", background: "#00E676", color: "#000", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }
};

export default WorkerDashboard;