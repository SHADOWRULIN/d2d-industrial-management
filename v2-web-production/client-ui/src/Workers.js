import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const Workers = () => {
  const { id } = useParams(); // Current Proposal ID
  const navigate = useNavigate();
  
  const [projectLogs, setProjectLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterWorker, setFilterWorker] = useState(""); // For searching within project logs

  // Load all Machine Logs associated with THIS proposal ID
  const loadProjectLogs = useCallback(() => {
    setLoading(true);
    axios.get(`http://127.0.0.1:5000/api/director/machine_logs/${id}`)
         .then(res => {
            setProjectLogs(res.data);
            setLoading(false);
         })
         .catch(err => {
            console.error("Error loading project logs:", err);
            setLoading(false);
         });
  }, [id]);

  useEffect(() => {
    loadProjectLogs();
  }, [loadProjectLogs]);

  // Filter logs based on search input
  const displayedLogs = projectLogs.filter(log => 
    log.worker_name.toLowerCase().includes(filterWorker.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.wrapper}>
        
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate(`/director/project/${id}/manufacturing`)} style={styles.backBtn}>← Back</button>
          <h2 style={styles.title}>Project Utilization Audit | <span style={{color: '#FFAB40'}}>Proposal #{id}</span></h2>
        </div>

        {/* Audit Dashboard Card */}
        <div style={styles.fullCard}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Machine Usage History</h3>
                {/* Search box to find a specific worker's contribution to this project */}
                <input 
                    placeholder="Search worker name..." 
                    style={styles.searchInput} 
                    value={filterWorker}
                    onChange={(e) => setFilterWorker(e.target.value)}
                />
            </div>
            
            {loading ? (
                <p style={styles.statusText}>Loading activity data...</p>
            ) : displayedLogs.length > 0 ? (
                <div style={styles.logGrid}>
                    {displayedLogs.map((log, idx) => (
                        <motion.div 
                            key={idx} 
                            whileHover={{ scale: 1.02 }}
                            style={styles.logItem}
                        >
                            <div style={styles.logHeader}>
                                <span style={styles.workerBadge}>👷 {log.worker_name}</span>
                                <span style={styles.dateTag}>{log.log_date}</span>
                            </div>
                            <h4 style={styles.machineTitle}>🔧 {log.machine_name}</h4>
                            <p style={styles.description}>"{log.work_description || "No description provided"}"</p>
                            <div style={styles.logFooter}>
                                <span style={styles.hourTag}>⏱️ {log.hours_used} Hours</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={styles.emptyState}>
                    <p>No machine utilization has been logged for this project yet.</p>
                    <small style={{color: '#555'}}>Logs submitted by workers via the Worker Portal will appear here.</small>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Segoe UI', sans-serif", padding: "40px" },
  wrapper: { maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", borderBottom: '1px solid #333', paddingBottom: '20px' },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid #444", color: "white", padding: "10px 20px", borderRadius: "20px", cursor: "pointer" },
  title: { color: "white", margin: 0 },

  fullCard: { background: "#1a1a1a", padding: "30px", borderRadius: "15px", border: "1px solid #333", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  cardTitle: { color: '#FFAB40', margin: 0 },
  
  searchInput: { padding: "10px 15px", borderRadius: "8px", border: "1px solid #444", background: "#2a2a2a", color: "white", outline: "none", width: '250px' },
  
  statusText: { color: '#888', textAlign: 'center', marginTop: '40px' },
  
  // Log Grid
  logGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  logItem: { background: '#252525', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #FFAB40', display: 'flex', flexDirection: 'column', gap: '10px' },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  workerBadge: { background: '#333', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  dateTag: { color: '#666', fontSize: '11px' },
  machineTitle: { color: '#FFAB40', margin: '5px 0' },
  description: { fontSize: '13px', color: '#ccc', fontStyle: 'italic', lineHeight: '1.5', flex: 1 },
  logFooter: { borderTop: '1px solid #333', paddingTop: '10px', marginTop: '5px' },
  hourTag: { color: '#69F0AE', fontWeight: 'bold', fontSize: '13px' },

  emptyState: { textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px dashed #333', color: '#666' }
};

export default Workers;