import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const DirectorDashboard = () => {
  const navigate = useNavigate();
  
  // TABS
  const [activeTab, setActiveTab] = useState("proposals"); 

  // DATA STATES
  const [proposals, setProposals] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // LOGS & FORMS
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [workerLogs, setWorkerLogs] = useState([]);
  const [workerForm, setWorkerForm] = useState({ worker_name: "", worker_job: "" });

  // MACHINE STATES
  const [newMachine, setNewMachine] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [machineUsageLogs, setMachineUsageLogs] = useState([]);

  // 🟢 NEW: PROPOSAL DETAIL STATE
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("director_auth")) navigate("/director");
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    try {
        const resProp = await axios.get(`${API_BASE_URL}/api/proposals`);
        setProposals(resProp.data.sort((a, b) => b.proposal_id - a.proposal_id));

        const resWork = await axios.get(`${API_BASE_URL}/api/director/workers/0`);
        setWorkers(resWork.data);

        const resMach = await axios.get(`${API_BASE_URL}/api/common/machines`);
        setMachines(resMach.data);
    } catch (err) { console.error("Error fetching data", err); }
  };

  // --- HANDLERS ---
  const handleStatusUpdate = async (id, status) => {
    let reason = null;
    if (status === "Rejected") {
        reason = prompt("Reason for rejection:");
        if (reason === null) return; // Cancelled
    }

    try {
      await axios.post(`${API_BASE_URL}/api/proposals/update_status`, { proposal_id: id, status: status, reason: reason });
      setRefresh(!refresh);
    } catch (error) { alert("Error updating status"); }
  };

  const handleViewWorkerLogs = async (workerId) => {
    setSelectedWorkerId(workerId);
    if (!workerId) { setWorkerLogs([]); return; }
    try {
        const res = await axios.get(`${API_BASE_URL}/api/worker/tasks/${workerId}`);
        setWorkerLogs(res.data);
    } catch (err) { console.error("Error fetching logs"); }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/director/workers/add`, workerForm);
        alert("✅ Worker Added!");
        setWorkerForm({ worker_name: "", worker_job: "" });
        setRefresh(!refresh);
    } catch (err) { alert("Error adding worker."); }
  };

  const handleDeleteWorker = async (workerId) => {
    if(!window.confirm("Remove this worker?")) return;
    try {
        await axios.delete(`${API_BASE_URL}/api/director/workers/delete/${workerId}`);
        setRefresh(!refresh);
    } catch (err) { alert("Delete failed."); }
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    if(!newMachine) return;
    try {
        await axios.post(`${API_BASE_URL}/api/director/machines/add`, { machine_name: newMachine });
        alert("⚙️ Machine Added!");
        setNewMachine("");
        setRefresh(!refresh);
    } catch (err) { alert("Error adding machine."); }
  };

  const handleViewMachineLogs = async (machineName) => {
      setSelectedMachine(machineName);
      if(!machineName) { setMachineUsageLogs([]); return; }
      try {
          const res = await axios.post(`${API_BASE_URL}/api/director/machine_usage_logs`, { machine_name: machineName });
          setMachineUsageLogs(res.data);
      } catch(err) { console.error(err); }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>Director Control Center</h2>
        
        <div style={styles.sliderContainer}>
            <motion.div 
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                    ...styles.activePill,
                    left: activeTab === "proposals" ? "4px" : activeTab === "workforce" ? "33.33%" : "66.66%"
                }}
            />
            <button onClick={() => setActiveTab("proposals")} style={{...styles.sliderBtn, color: activeTab === "proposals" ? "black" : "#888"}}>Proposals</button>
            <button onClick={() => setActiveTab("workforce")} style={{...styles.sliderBtn, color: activeTab === "workforce" ? "black" : "#888"}}>Workforce</button>
            <button onClick={() => setActiveTab("machines")} style={{...styles.sliderBtn, color: activeTab === "machines" ? "black" : "#888"}}>Machines</button>
        </div>

        <button onClick={() => navigate("/")} style={styles.logoutBtn}>Logout</button>
      </nav>

      <div style={styles.content}>
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PROPOSALS */}
          {activeTab === "proposals" && (
            <motion.div key="proposals" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={styles.card}>
                    <h3 style={styles.tableTitle}>Client Project Proposals</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headerRow}>
                                <th style={styles.th}>ID</th><th style={styles.th}>Client</th>
                                <th style={styles.th}>Project</th><th style={styles.th}>Status</th><th style={styles.th}>Details</th><th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.map((p) => (
                                <tr key={p.proposal_id} style={styles.row}>
                                    <td style={styles.td}>#{p.proposal_id}</td>
                                    <td style={styles.td}><span style={{color:'#aaa'}}>{p.client_name}</span></td>
                                    <td style={styles.td}><strong style={{color:'white'}}>{p.project_name || "New Project"}</strong></td>
                                    <td style={styles.td}><span style={{...styles.badge, ...getStatusStyle(p.status)}}>{p.status}</span></td>
                                    
                                    {/* 🟢 NEW: View Details Button */}
                                    <td style={styles.td}>
                                        <button onClick={() => setSelectedProposal(p)} style={styles.viewBtn}>👁️ View</button>
                                    </td>

                                    <td style={styles.td}>
                                        {p.status === "Pending" && (
                                            <div style={styles.actionGroup}>
                                                <button onClick={() => handleStatusUpdate(p.proposal_id, "Approved")} style={styles.approveBtn}>✓</button>
                                                <button onClick={() => handleStatusUpdate(p.proposal_id, "Rejected")} style={styles.rejectBtn}>✗</button>
                                            </div>
                                        )}
                                        {p.status === "Approved" && <button onClick={() => navigate(`/director/project/${p.proposal_id}`)} style={styles.manageBtn}>Manage →</button>}
                                        {p.status === "Completed" && <span style={{color:'#00E676'}}>Done</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
          )}

          {/* TAB 2: WORKFORCE */}
          {activeTab === "workforce" && (
            <motion.div key="workforce" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} style={styles.splitLayout}>
                <div style={{...styles.card, flex: 1}}>
                    <h3 style={styles.tableTitle}>Hire New Worker</h3>
                    <form onSubmit={handleAddWorker} style={styles.form}>
                        <label style={styles.label}>Name</label>
                        <input style={styles.input} value={workerForm.worker_name} onChange={e => setWorkerForm({...workerForm, worker_name: e.target.value})} required />
                        <label style={styles.label}>Job Role</label>
                        <input style={styles.input} value={workerForm.worker_job} onChange={e => setWorkerForm({...workerForm, worker_job: e.target.value})} required />
                        <button style={styles.manageBtn}>Add to Workforce ➕</button>
                    </form>
                    
                    <h3 style={{...styles.tableTitle, marginTop: '30px'}}>Active Staff</h3>
                    <div style={styles.workerList}>
                        {workers.map(w => (
                            <div key={w.worker_id} style={styles.workerItem}>
                                <div>
                                    <div style={{color:'#fff', fontWeight:'bold'}}>{w.worker_name}</div>
                                    <div style={{color:'#666', fontSize:'12px'}}>{w.worker_job}</div>
                                </div>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button onClick={() => handleViewWorkerLogs(w.worker_id)} style={styles.viewBtn}>View Logs</button>
                                    <button onClick={() => handleDeleteWorker(w.worker_id)} style={styles.rejectBtn}>🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{...styles.card, flex: 1.2}}>
                    <h3 style={styles.tableTitle}>Audit: {selectedWorkerId ? workers.find(w => w.worker_id === parseInt(selectedWorkerId))?.worker_name : "Select a Worker"}</h3>
                    <div style={styles.logContainer}>
                        {workerLogs.length > 0 ? (
                            workerLogs.map((log, idx) => (
                                <div key={idx} style={styles.logEntry}>
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                        <span style={styles.logBadge}>{log.type}</span>
                                        <span style={{fontSize:'11px', color:'#555'}}>{log.date}</span>
                                    </div>
                                    <div style={{color: '#FFAB40', fontSize:'14px', fontWeight:'bold'}}>{log.title || log.project_name}</div>
                                    <div style={{color: '#ddd', fontSize:'13px', margin:'5px 0'}}>"{log.description || log.work_description}"</div>
                                    <div style={{fontSize:'12px', color:'#777'}}>🔧 {log.machines} | ⏱️ {log.hours}h</div>
                                </div>
                            ))
                        ) : <p style={{textAlign:'center', color:'#444', marginTop:'50px'}}>Select 'View Logs' to see history.</p>}
                    </div>
                </div>
            </motion.div>
          )}

          {/* TAB 3: MACHINES */}
          {activeTab === "machines" && (
            <motion.div key="machines" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} style={styles.splitLayout}>
                
                <div style={{...styles.card, flex: 1}}>
                    <h3 style={styles.tableTitle}>Add New Machine</h3>
                    <div style={{display:'flex', gap:'15px', alignItems:'flex-end'}}>
                        <div style={{flex: 1}}>
                            <label style={styles.label}>Machine Name</label>
                            <input 
                                style={styles.input} 
                                placeholder="e.g. CNC Miller"
                                value={newMachine} 
                                onChange={e => setNewMachine(e.target.value)} 
                            />
                        </div>
                        <button onClick={handleAddMachine} style={styles.addBtn}>Add</button>
                    </div>

                    <h3 style={{...styles.tableTitle, marginTop:'30px'}}>Available Machines</h3>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                        {machines.map((m, i) => (
                            <span key={i} style={styles.machineTag}>{m}</span>
                        ))}
                    </div>
                </div>

                <div style={{...styles.card, flex: 1.5}}>
                    <h3 style={styles.tableTitle}>Machine Usage Logs</h3>
                    <div style={{marginBottom: '20px'}}>
                        <label style={styles.label}>Select Machine to View History</label>
                        <select 
                            style={styles.select} 
                            value={selectedMachine} 
                            onChange={(e) => handleViewMachineLogs(e.target.value)}
                        >
                            <option value="">-- Select Machine --</option>
                            {machines.map((m, i) => <option key={i} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headerRow}>
                                <th style={styles.th}>Worker</th><th style={styles.th}>Project</th>
                                <th style={styles.th}>Date</th><th style={styles.th}>Hours</th><th style={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machineUsageLogs.length === 0 ? (
                                <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#666'}}>No logs found for this machine.</td></tr>
                            ) : (
                                machineUsageLogs.map((log, i) => (
                                    <tr key={i} style={styles.row}>
                                        <td style={styles.td}><span style={{color: '#FFAB40'}}>{log.worker_name}</span></td>
                                        <td style={styles.td}>{log.project_name}</td>
                                        <td style={styles.td}>{log.log_date}</td>
                                        <td style={styles.td}>{log.hours_used}</td>
                                        <td style={styles.td}>
                                            <span style={{...styles.badge, color: log.status === 'Completed' ? '#00E676' : '#FFAB40', borderColor: log.status === 'Completed' ? '#00E676' : '#FFAB40'}}>
                                                {log.status}
                                            </span>
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

        {/* 🟢 PROPOSAL DETAIL MODAL */}
        {selectedProposal && (
            <div style={styles.modalOverlay} onClick={() => setSelectedProposal(null)}>
                <motion.div initial={{scale:0.9}} animate={{scale:1}} style={styles.modalCard} onClick={e => e.stopPropagation()}>
                    <h2 style={{color:'#FFAB40', marginTop:0}}>{selectedProposal.project_name}</h2>
                    <p style={{color:'#aaa', fontSize:'13px'}}>From Client: {selectedProposal.client_name}</p>
                    
                    <div style={styles.modalField}>
                        <label style={styles.label}>Service Type</label>
                        <div style={{color:'white'}}>{selectedProposal.services}</div>
                    </div>
                    
                    <div style={styles.modalField}>
                        <label style={styles.label}>Description</label>
                        <div style={styles.descBox}>{selectedProposal.proposal_description}</div>
                    </div>

                    {selectedProposal.client_image && (
                        <div style={styles.modalField}>
                            <label style={styles.label}>Reference Image</label>
                            <img src={`${API_BASE_URL}/${selectedProposal.client_image}`} style={styles.refImage} alt="ref" />
                        </div>
                    )}

                    {selectedProposal.rejection_reason && (
                        <div style={styles.rejectBox}>
                            <label style={{...styles.label, color:'#FF5252'}}>Rejection Reason:</label>
                            <div style={{color:'#FF5252'}}>{selectedProposal.rejection_reason}</div>
                        </div>
                    )}

                    <button onClick={() => setSelectedProposal(null)} style={styles.closeBtn}>Close</button>
                </motion.div>
            </div>
        )}

      </div>
    </div>
  );
};

const getStatusStyle = (status) => {
  if (status === "Approved") return { background: "rgba(46, 125, 50, 0.2)", color: "#69F0AE", border: "1px solid #2E7D32" };
  if (status === "Rejected") return { background: "rgba(198, 40, 40, 0.2)", color: "#FF5252", border: "1px solid #C62828" };
  if (status === "Completed") return { background: "rgba(0, 230, 118, 0.2)", color: "#fff", border: "1px solid #00E676" };
  return { background: "rgba(249, 168, 37, 0.2)", color: "#FFD740", border: "1px solid #F9A825" };
};

const styles = {
  container: { minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Segoe UI', sans-serif", color: "white" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 40px", background: "#1a1a1a", borderBottom: "1px solid #333" },
  logo: { margin: 0, fontSize: "20px", fontWeight: 'bold' },
  
  sliderContainer: { position: 'relative', display: 'flex', background: '#222', borderRadius: '30px', padding: '4px', width: '450px', height: '40px', border: '1px solid #444' },
  activePill: { position: 'absolute', top: '4px', bottom: '4px', width: 'calc(33.33% - 4px)', background: '#FFAB40', borderRadius: '25px', zIndex: 0 },
  sliderBtn: { flex: 1, background: 'none', border: 'none', zIndex: 1, cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'color 0.3s ease' },
  logoutBtn: { background: "rgba(255, 82, 82, 0.1)", border: "1px solid #FF5252", color: "#FF5252", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" },
  
  content: { padding: "30px", maxWidth: "1400px", margin: "0 auto" },
  splitLayout: { display: 'flex', gap: '30px' },
  card: { background: "#161616", borderRadius: "12px", padding: "25px", border: "1px solid #333" },
  tableTitle: { marginTop: 0, marginBottom: "20px", color: "#FFAB40", fontSize:'18px' },
  table: { width: "100%", borderCollapse: "collapse" },
  headerRow: { background: "rgba(255,255,255,0.02)", borderBottom: "1px solid #444" },
  th: { padding: "12px", textAlign: "left", color: "#666", fontSize: "12px", textTransform: 'uppercase' },
  td: { padding: "12px", borderBottom: "1px solid #222" },
  badge: { padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", border: '1px solid' },
  actionGroup: { display: "flex", gap: "10px" },
  approveBtn: { background: "#2E7D32", color: "white", border: "none", width: "28px", height: "28px", borderRadius: "5px", cursor: "pointer" },
  rejectBtn: { background: "#C62828", color: "white", border: "none", width: "28px", height: "28px", borderRadius: "5px", cursor: "pointer" },
  manageBtn: { background: "#FFAB40", color: "black", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width:'100%' },
  addBtn: { background: "#FFAB40", color: "black", border: "none", padding: "0 25px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", height: "42px" },
  viewBtn: { background: 'transparent', border: '1px solid #448AFF', color: '#448AFF', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' },

  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '11px', color: '#777', textTransform: 'uppercase' },
  input: { padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px', width: '100%', boxSizing: 'border-box' },
  select: { padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '5px', width: '100%', outline: 'none' },

  workerList: { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  workerItem: { background: '#222', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  
  machineTag: { padding: '6px 12px', background: '#333', color: '#FFAB40', borderRadius: '20px', fontSize: '12px', border: '1px solid #444' },
  logContainer: { maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' },
  logEntry: { background: '#1e1e1e', padding: '15px', borderRadius: '10px', marginBottom: '15px', borderLeft: '4px solid #FFAB40' },
  logBadge: { background: '#333', color: '#FFAB40', padding: '2px 6px', fontSize: '10px', borderRadius: '4px' },

  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { background: '#1e1e1e', padding: '30px', borderRadius: '15px', width: '500px', border: '1px solid #444', color: 'white', maxHeight: '90vh', overflowY: 'auto' },
  modalField: { marginBottom: '15px' },
  descBox: { background: '#252525', padding: '10px', borderRadius: '5px', color: '#ddd', fontSize: '14px', lineHeight: '1.5' },
  refImage: { width: '100%', borderRadius: '10px', marginTop: '5px', border: '1px solid #444' },
  rejectBox: { marginTop: '15px', padding: '10px', background: 'rgba(255, 82, 82, 0.1)', border: '1px solid #FF5252', borderRadius: '5px' },
  closeBtn: { marginTop: '20px', width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default DirectorDashboard;