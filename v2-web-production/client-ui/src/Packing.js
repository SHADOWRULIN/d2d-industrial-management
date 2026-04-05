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

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.card}>
        
        <div style={styles.header}>
            <button onClick={() => navigate(`/director/project/${id}/delivery`)} style={styles.backBtn}>← Back</button>
            <h2 style={{margin:0, color: 'white'}}>Packing Operations</h2>
        </div>

        <h3 style={{color: '#FFAB40', borderBottom: '1px solid #333', paddingBottom: '10px'}}>Assign Packing Task</h3>
        
        <form onSubmit={handleSave} style={styles.form}>
            <label style={styles.label}>Assigned Worker Name</label>
            <input style={styles.input} placeholder="Enter Name" onChange={e => setForm({...form, worker_name: e.target.value})} required />
            
            <div style={{display:'flex', gap:'10px'}}>
                <div style={{flex:1}}>
                    <label style={styles.label}>Start Date</label>
                    <input type="date" style={styles.input} onChange={e => setForm({...form, start_date: e.target.value})} required />
                </div>
                <div style={{flex:1}}>
                    <label style={styles.label}>End Date</label>
                    <input type="date" style={styles.input} onChange={e => setForm({...form, end_date: e.target.value})} required />
                </div>
            </div>
            
            <button style={styles.btn}>Save Packing Data 💾</button>
        </form>

        <h3 style={{marginTop: '30px', color: 'white'}}>History</h3>
        <div style={styles.listContainer}>
            {history.map((h, i) => (
                <div key={i} style={styles.listItem}>
                    <strong style={{color: '#FFAB40'}}>{h.worker_name}</strong> 
                    <span style={{color: '#aaa', float: 'right', fontSize: '13px'}}>{h.start_date} to {h.end_date}</span>
                </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

const styles = { 
  container: { minHeight: "100vh", background: "#121212", display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Segoe UI', sans-serif" },
  
  card: { background: "rgba(255, 255, 255, 0.05)", width: "500px", padding: "40px", borderRadius: "15px", border: "1px solid #333", backdropFilter: "blur(10px)" },
  
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
  backBtn: { background: "rgba(255,255,255,0.1)", border: "1px solid #444", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer" },
  
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { fontWeight: "bold", fontSize: "13px", color: "#aaa", marginBottom: "-5px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "rgba(0,0,0,0.3)", color: "white", outline: "none" },
  
  btn: { padding: "15px", background: "linear-gradient(90deg, #FFAB40, #FF6D00)", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: '10px' },
  
  listContainer: { maxHeight: '200px', overflowY: 'auto' },
  listItem: { padding: '15px', borderBottom: '1px solid #333', background: 'rgba(255,255,255,0.02)', marginBottom: '5px', borderRadius: '5px' } 
};

export default Packing;