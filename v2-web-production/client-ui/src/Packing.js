import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const Packing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ worker_name: "", start_date: "", end_date: "" });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadHistory = useCallback(() => {
    axios.get(`${API_BASE_URL}/api/director/packing/${id}`).then(res => setHistory(res.data));
  }, [id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/director/packing/add`, { ...form, proposal_id: id });
        alert("✅ Packing Data Saved!");
        loadHistory();
    } catch (err) { alert("Error saving data"); }
  };

  const isMobile = windowWidth < 600;

  return (
    <div style={{ ...styles.container, padding: isMobile ? "20px 10px" : "40px" }}>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        style={{
          ...styles.card,
          width: isMobile ? "100%" : "500px",
          padding: isMobile ? "25px" : "40px"
        }}
      >
        
        <div style={{ ...styles.header, gap: isMobile ? "10px" : "20px" }}>
            <button onClick={() => navigate(`/director/project/${id}/delivery`)} style={styles.backBtn}>← Back</button>
            <h2 style={{ margin: 0, color: 'white', fontSize: isMobile ? "20px" : "24px" }}>Packing Operations</h2>
        </div>

        <h3 style={{ color: '#FFAB40', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: isMobile ? "16px" : "18px" }}>Assign Packing Task</h3>
        
        <form onSubmit={handleSave} style={styles.form}>
            <label style={styles.label}>Assigned Worker Name</label>
            <input 
              style={styles.input} 
              placeholder="Enter Name" 
              value={form.worker_name}
              onChange={e => setForm({...form, worker_name: e.target.value})} 
              required 
            />
            
            <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ flex: 1 }}>
                    <label style={styles.label}>Start Date</label>
                    <input type="date" style={styles.input} onChange={e => setForm({...form, start_date: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={styles.label}>End Date</label>
                    <input type="date" style={styles.input} onChange={e => setForm({...form, end_date: e.target.value})} required />
                </div>
            </div>
            
            <button style={{ ...styles.btn, fontSize: isMobile ? "14px" : "16px" }}>Save Packing Data 💾</button>
        </form>

        <h3 style={{ marginTop: '30px', color: 'white', fontSize: isMobile ? "16px" : "18px" }}>History</h3>
        <div style={styles.listContainer}>
            {history.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', fontSize: '13px' }}>No packing records found.</p>
            ) : (
              history.map((h, i) => (
                <div key={i} style={styles.listItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#FFAB40', fontSize: isMobile ? '14px' : '16px' }}>{h.worker_name}</strong> 
                      <span style={{ color: '#aaa', fontSize: isMobile ? '11px' : '13px' }}>{h.start_date} to {h.end_date}</span>
                    </div>
                </div>
              ))
            )}
        </div>
      </motion.div>
    </div>
  );
};

const styles = { 
  container: { minHeight: "100vh", background: "#121212", display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Segoe UI', sans-serif", boxSizing: 'border-box' },
  
  card: { background: "rgba(255, 255, 255, 0.05)", borderRadius: "15px", border: "1px solid #333", backdropFilter: "blur(10px)", boxSizing: 'border-box' },
  
  header: { display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
  backBtn: { background: "rgba(255,255,255,0.1)", border: "1px solid #444", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", fontSize: "13px" },
  
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { fontWeight: "bold", fontSize: "13px", color: "#aaa", marginBottom: "-5px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "rgba(0,0,0,0.3)", color: "white", outline: "none", width: "100%", boxSizing: "border-box" },
  
  btn: { padding: "15px", background: "linear-gradient(90deg, #FFAB40, #FF6D00)", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: '10px' },
  
  listContainer: { maxHeight: '200px', overflowY: 'auto' },
  listItem: { padding: '15px', borderBottom: '1px solid #333', background: 'rgba(255,255,255,0.02)', marginBottom: '5px', borderRadius: '5px' } 
};

export default Packing;