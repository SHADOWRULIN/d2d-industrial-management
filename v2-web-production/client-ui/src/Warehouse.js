import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const Warehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  
  // ✅ FIX: Default matches DB constraint ('Inhouse')
  const [type, setType] = useState("Inhouse"); 

  const loadDocs = useCallback(() => {
    axios.get(`${API_BASE_URL}/api/director/warehouse/${id}`)
         .then(res => setDocs(res.data))
         .catch(err => console.error(err));
  }, [id]);

  useEffect(() => { loadDocs(); }, [id, loadDocs]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if(!file) return alert("Select a file");
    
    const data = new FormData();
    data.append("proposal_id", id);
    data.append("type", type);
    data.append("file", file);

    try {
        const res = await axios.post(`${API_BASE_URL}/api/director/warehouse/upload`, data);
        
        // ✅ FIX: Check if server actually saved it
        if (res.data.success) {
            alert("✅ Uploaded Successfully!");
            setFile(null);
            loadDocs();
        } else {
            alert("❌ Database Error: " + res.data.message);
        }
    } catch (err) {
        alert("Network Error. Is server running?");
    }
  };

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.wrapper}>
        
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate(`/director/project/${id}/manufacturing`)} style={styles.backBtn}>← Back</button>
          <h2 style={styles.title}>Warehouse & Inventory</h2>
        </div>

        <div style={styles.split}>
          
          {/* Upload Card */}
          <div style={styles.card}>
            <h3 style={{color: '#64FFDA', borderBottom: '1px solid #333', paddingBottom: '10px'}}>Upload Document</h3>
            <form onSubmit={handleUpload} style={styles.form}>
              <label style={styles.label}>Warehouse Type</label>
              
              {/* ✅ FIX: Values must be 'Inhouse' or 'Outsource' */}
              <select style={styles.input} value={type} onChange={e => setType(e.target.value)}>
                <option value="Inhouse">Inhouse Storage</option>
                <option value="Outsource">Outsource Logistics</option>
              </select>
              
              <label style={styles.label}>Select File</label>
              <div style={styles.fileBox}>
                <input type="file" onChange={e => setFile(e.target.files[0])} style={{color: 'white'}} />
              </div>
              
              <button style={styles.btn}>Upload to DB 💾</button>
            </form>
          </div>

          {/* Table Card */}
          <div style={{...styles.card, flex: 2}}>
            <h3 style={{color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px'}}>Stored Documents</h3>
            <table style={styles.table}>
              <thead><tr style={styles.headerRow}><th>Type</th><th>Filename</th><th>Action</th></tr></thead>
              <tbody>
                {docs.length === 0 ? (
                    <tr><td colSpan="3" style={{padding: '20px', textAlign: 'center', color: '#888'}}>No documents uploaded yet.</td></tr>
                ) : (
                    docs.map(d => (
                    <tr key={d.id} style={styles.row}>
                        <td style={styles.td}>{d.type === "Inhouse" ? "Inhouse Storage" : "Outsource Logistics"}</td>
                        <td style={styles.td}>{d.filename}</td>
                        <td style={styles.td}>
                            <button style={styles.viewBtn} onClick={() => alert("File stored in 'uploads' folder.")}>Open</button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#121212", fontFamily: "'Segoe UI', sans-serif", padding: "40px" },
  wrapper: { maxWidth: "1200px", margin: "0 auto" },
  
  header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", borderBottom: '1px solid #333', paddingBottom: '15px' },
  backBtn: { background: "rgba(255,255,255,0.1)", border: "1px solid #444", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer" },
  title: { color: "white", margin: 0 },

  split: { display: "flex", gap: "30px", flexWrap: "wrap" },
  
  card: { background: "rgba(255, 255, 255, 0.05)", padding: "30px", borderRadius: "15px", flex: 1, minWidth: "350px", border: "1px solid #333" },
  
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { fontWeight: "bold", fontSize: "13px", color: "#aaa", marginBottom: "-5px" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "#222", color: "white", outline: "none", boxSizing: "border-box" },
  
  fileBox: { padding: "15px", border: "1px dashed #444", borderRadius: "8px", background: "rgba(0,0,0,0.2)" },
  
  btn: { padding: "12px", background: "linear-gradient(90deg, #64FFDA, #1DE9B6)", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: '10px', fontWeight: 'bold' },
  viewBtn: { padding: "5px 10px", background: "rgba(255, 171, 64, 0.2)", color: "#FFAB40", border: "1px solid #FFAB40", borderRadius: "5px", cursor: "pointer" },
  
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px", color: "white" },
  headerRow: { background: "rgba(255,255,255,0.1)", textAlign: "left" },
  row: { borderBottom: "1px solid #333" },
  td: { padding: "12px" }
};

export default Warehouse;