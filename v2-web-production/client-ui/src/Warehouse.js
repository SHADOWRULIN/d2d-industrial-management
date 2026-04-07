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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // ✅ FIX: Default matches DB constraint ('Inhouse')
  const [type, setType] = useState("Inhouse"); 

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const isMobile = windowWidth < 768;

  const dynamicHeader = {
    ...styles.header,
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "flex-start" : "center",
    gap: isMobile ? "15px" : "20px"
  };

  const dynamicSplit = {
    ...styles.split,
    flexDirection: isMobile ? "column" : "row"
  };

  return (
    <div style={{ ...styles.container, padding: isMobile ? "20px 15px" : "40px" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.wrapper}>
        
        {/* Header */}
        <div style={dynamicHeader}>
          <button onClick={() => navigate(`/director/project/${id}/manufacturing`)} style={styles.backBtn}>← Back</button>
          <h2 style={{ ...styles.title, fontSize: isMobile ? "20px" : "24px" }}>Warehouse & Inventory</h2>
        </div>

        <div style={dynamicSplit}>
          
          {/* Upload Card */}
          <div style={{ ...styles.card, minWidth: isMobile ? "100%" : "350px" }}>
            <h3 style={{color: '#64FFDA', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '18px'}}>Upload Document</h3>
            <form onSubmit={handleUpload} style={styles.form}>
              <label style={styles.label}>Warehouse Type</label>
              
              <select style={styles.input} value={type} onChange={e => setType(e.target.value)}>
                <option value="Inhouse">Inhouse Storage</option>
                <option value="Outsource">Outsource Logistics</option>
              </select>
              
              <label style={styles.label}>Select File</label>
              <div style={styles.fileBox}>
                <input type="file" onChange={e => setFile(e.target.files[0])} style={{color: 'white', width: '100%', fontSize: '14px'}} />
              </div>
              
              <button style={{ ...styles.btn, fontSize: isMobile ? "14px" : "16px" }}>Upload to DB 💾</button>
            </form>
          </div>

          {/* Table Card */}
          <div style={{...styles.card, flex: 2, minWidth: isMobile ? "100%" : "350px"}}>
            <h3 style={{color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '18px'}}>Stored Documents</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ ...styles.table, minWidth: isMobile ? "500px" : "100%" }}>
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
  title: { color: "white", margin: 0, fontWeight: "600" },

  split: { display: "flex", gap: "30px" },
  
  card: { background: "rgba(255, 255, 255, 0.05)", padding: "25px", borderRadius: "15px", border: "1px solid #333", boxSizing: "border-box" },
  
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { fontWeight: "bold", fontSize: "12px", color: "#777", marginBottom: "-5px", textTransform: "uppercase" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "#222", color: "white", outline: "none", boxSizing: "border-box", fontSize: "14px" },
  
  fileBox: { padding: "15px", border: "1px dashed #444", borderRadius: "8px", background: "rgba(0,0,0,0.2)", boxSizing: "border-box" },
  
  btn: { padding: "12px", background: "linear-gradient(90deg, #64FFDA, #1DE9B6)", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: '10px', fontWeight: 'bold' },
  viewBtn: { padding: "5px 10px", background: "rgba(255, 171, 64, 0.2)", color: "#FFAB40", border: "1px solid #FFAB40", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
  
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "white" },
  headerRow: { background: "rgba(255,255,255,0.1)", textAlign: "left" },
  row: { borderBottom: "1px solid #333" },
  td: { padding: "12px" }
};

export default Warehouse;