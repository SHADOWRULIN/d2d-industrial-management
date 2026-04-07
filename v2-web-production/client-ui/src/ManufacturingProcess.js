import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const ManufacturingProcess = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [machines, setMachines] = useState([]); 
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  
  const [form, setForm] = useState({ 
      machine: "", 
      work: "", 
      worker_id: "", 
      start_date: "", 
      end_date: "", 
      status: "Pending" 
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadTasks = useCallback(() => {
    axios.get(`${API_BASE_URL}/api/director/manufacturing/${id}`)
         .then(res => {
             if (Array.isArray(res.data)) {
                 setTasks(res.data);
             }
         })
         .catch(err => console.error("❌ Error fetching tasks:", err));
  }, [id]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/common/machines`)
         .then(res => {
             setMachines(res.data);
             if(res.data.length > 0) setForm(f => ({...f, machine: res.data[0]}));
         })
         .catch(err => console.error(err));

    axios.get(`${API_BASE_URL}/api/director/workers/0`)
         .then(res => setWorkers(res.data))
         .catch(err => console.error(err));
         
    loadTasks();
  }, [id, loadTasks]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.worker_id) {
        alert("⚠️ Please select a worker!");
        return;
    }

    const payload = { ...form, proposal_id: id };

    try {
        const res = await axios.post(`${API_BASE_URL}/api/director/manufacturing/add`, payload);
        if (res.status === 200 || res.status === 201) {
            alert("✅ Task Assigned Successfully!");
            setForm({ ...form, work: "" }); 
            loadTasks(); 
        }
    } catch (err) { 
        alert("Error saving task."); 
    }
  };

  const isMobile = windowWidth < 768;

  return (
    <div style={{ ...styles.container, padding: isMobile ? "20px 15px" : "40px" }}>
      <style>
        {`
          option { background-color: #1e1e1e; color: white; padding: 10px; }
          input, select { box-sizing: border-box; } 
        `}
      </style>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.wrapper}>
        <div style={{ ...styles.header, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "15px" : "20px" }}>
          <button onClick={() => navigate(`/director/project/${id}/manufacturing`)} style={styles.backBtn}>← Back</button>
          <h2 style={{ ...styles.title, fontSize: isMobile ? "20px" : "24px" }}>Manufacturing Schedule</h2>
        </div>

        <div style={{ ...styles.split, flexDirection: isMobile ? "column" : "row" }}>
          <div style={{ ...styles.card, minWidth: isMobile ? "100%" : "350px" }}>
            <h3 style={{color: '#E040FB', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0, fontSize: '18px'}}>Assign Task</h3>
            <form onSubmit={handleSave} style={styles.form}>
              
              <div style={styles.inputGroup}>
                  <label style={styles.label}>Select Machine</label>
                  <select style={styles.input} value={form.machine} onChange={e => setForm({...form, machine: e.target.value})}>
                    <option value="">-- Select Machine --</option>
                    {machines.map((m, index) => <option key={index} value={m}>{m}</option>)}
                  </select>
              </div>

              <div style={styles.inputGroup}>
                  <label style={styles.label}>Work Description</label>
                  <input 
                    style={styles.input} 
                    value={form.work}
                    placeholder="e.g. Cutting Metal parts" 
                    onChange={e => setForm({...form, work: e.target.value})} 
                    required 
                  />
              </div>

              <div style={styles.inputGroup}>
                  <label style={styles.label}>Assign Worker</label>
                  <select style={styles.input} value={form.worker_id} onChange={e => setForm({...form, worker_id: e.target.value})} required>
                    <option value="">-- Select Worker --</option>
                    {workers.map(w => (
                        <option key={w.worker_id} value={w.worker_id}>
                            {w.worker_name} ({w.worker_job})
                        </option>
                    ))}
                  </select>
              </div>

              <div style={{ ...styles.dateRow, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "15px" : "20px" }}>
                <div style={styles.dateCol}>
                    <label style={styles.label}>Start Date</label>
                    <input type="date" style={styles.input} onChange={e => setForm({...form, start_date: e.target.value})} required />
                </div>
                <div style={styles.dateCol}>
                    <label style={styles.label}>End Date</label>
                    <input type="date" style={styles.input} onChange={e => setForm({...form, end_date: e.target.value})} required />
                </div>
              </div>

              <button style={styles.btn}>Save & Assign 💾</button>
            </form>
          </div>

          <div style={{...styles.card, flex: 2, minWidth: isMobile ? "100%" : "350px"}}>
            <h3 style={{color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0, fontSize: '18px'}}>Scheduled Tasks</h3>
            <div style={{overflowX: 'auto'}}>
                <table style={{ ...styles.table, minWidth: isMobile ? "600px" : "100%" }}>
                <thead>
                    <tr style={styles.headerRow}>
                        <th>Machine</th>
                        <th>Work</th>
                        <th>Assigned To</th>
                        <th>Dates</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.length === 0 ? (
                        <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color: '#666'}}>No tasks found.</td></tr>
                    ) : (
                        tasks.map((t, index) => (
                        <tr key={t.id || index} style={styles.row}>
                            <td style={styles.td}>
                                <span style={{color: '#E040FB', fontWeight:'bold'}}>
                                    {t.machine || t.machines || "Unknown"}
                                </span>
                            </td>
                            <td style={styles.td}>{t.work || t.work_description}</td>
                            <td style={styles.td}>{t.worker_name}</td>
                            <td style={styles.td}><small style={{color:'#aaa'}}>{t.start_date} <br/> {t.end_date}</small></td>
                            <td style={styles.td}>
                                <span style={{
                                    ...styles.badge, 
                                    borderColor: t.status === 'Completed' ? '#00E676' : '#E040FB',
                                    color: t.status === 'Completed' ? '#00E676' : '#E040FB'
                                }}>
                                    {t.status}
                                </span>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#121212", fontFamily: "'Segoe UI', sans-serif", overflowX: "hidden" },
  wrapper: { maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", marginBottom: "30px", borderBottom: '1px solid #333', paddingBottom: '15px' },
  backBtn: { background: "rgba(255,255,255,0.1)", border: "1px solid #444", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", fontSize: "14px" },
  title: { color: "white", margin: 0 },
  split: { display: "flex", gap: "30px", flexWrap: "wrap", alignItems: 'flex-start' },
  card: { background: "rgba(255, 255, 255, 0.05)", padding: "25px", borderRadius: "15px", flex: 1, border: "1px solid #333", boxSizing: "border-box" },
  form: { display: "flex", flexDirection: "column", gap: "20px" }, 
  inputGroup: { display: "flex", flexDirection: "column", width: "100%" }, 
  label: { fontWeight: "bold", fontSize: "12px", color: "#777", marginBottom: "8px", display: "block", textTransform: "uppercase" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "#222", color: "white", outline: "none", boxSizing: "border-box", fontSize: "14px" },
  dateRow: { display: 'flex', width: '100%' },
  dateCol: { flex: 1, display: 'flex', flexDirection: 'column' },
  btn: { width: "100%", padding: "14px", background: "linear-gradient(90deg, #E040FB, #7C4DFF)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: '10px', fontWeight: 'bold', fontSize: "15px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "white" },
  headerRow: { background: "rgba(255,255,255,0.1)", textAlign: "left" },
  row: { borderBottom: "1px solid #333" },
  td: { padding: "12px" },
  badge: { padding: "5px 10px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", border: "1px solid" }
};

export default ManufacturingProcess;