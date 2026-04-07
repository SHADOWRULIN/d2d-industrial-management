import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const FinalDelivery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [address, setAddress] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadHistory = useCallback(() => {
    axios.get(`${API_BASE_URL}/api/director/delivery/${id}`)
         .then(res => setHistory(res.data));
  }, [id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/director/delivery/add`, { proposal_id: id, address: address });
        alert("✅ Marked as Delivered!");
        setAddress(""); 
        loadHistory();
    } catch (err) { alert("Error saving data"); }
  };

  const isMobile = windowWidth < 600;

  return (
    <div style={{...styles.container, padding: isMobile ? "20px 10px" : "40px"}}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        style={{
          ...styles.card,
          width: isMobile ? "100%" : "500px",
          padding: isMobile ? "25px" : "40px"
        }}
      >
        <div style={{...styles.header, gap: isMobile ? "10px" : "20px"}}>
            <button onClick={() => navigate(`/director/project/${id}/delivery`)} style={styles.backBtn}>← Back</button>
            <h2 style={{margin:0, fontSize: isMobile ? '18px' : '22px'}}>Final Delivery</h2>
        </div>

        <h3 style={{color: '#69F0AE', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', fontSize: isMobile ? '16px' : '18px'}}>Shipping Information</h3>
        
        <form onSubmit={handleSave} style={styles.form}>
            <label style={styles.label}>Delivery Address</label>
            <input 
                style={styles.input} 
                placeholder="Enter full address..." 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                required 
            />
            <button style={{...styles.btn, fontSize: isMobile ? '14px' : '16px'}}>✅ Mark as Delivered</button>
        </form>

        <h3 style={{marginTop: '30px', color: '#fff', fontSize: isMobile ? '16px' : '18px'}}>Delivery Status</h3>
        <div style={styles.listContainer}>
            {history.length === 0 ? <p style={{color: '#888'}}>Status: Pending...</p> : 
                history.map((h, i) => (
                    <div key={i} style={styles.statusBox}>
                        <p style={{color: '#ddd', margin: '5px 0', fontSize: isMobile ? '13px' : '14px'}}><strong>Address:</strong> {h.address}</p>
                        <p style={{color: '#69F0AE', fontWeight: 'bold', margin: '5px 0', fontSize: isMobile ? '13px' : '14px'}}>Status: {h.status}</p>
                    </div>
                ))
            }
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: { 
    minHeight: "100vh", 
    background: "#121212", 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    fontFamily: "'Segoe UI', sans-serif",
    boxSizing: 'border-box'
  },
  
  card: { 
    background: "rgba(255, 255, 255, 0.05)", 
    backdropFilter: "blur(10px)",
    borderRadius: "20px", 
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    color: "white",
    boxSizing: 'border-box'
  },
  
  header: { 
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: '30px', 
    borderBottom: '1px solid rgba(255,255,255,0.1)', 
    paddingBottom: '15px' 
  },
  
  backBtn: { 
    background: "rgba(255,255,255,0.1)", 
    border: "1px solid rgba(255,255,255,0.2)", 
    color: "white", 
    padding: "8px 15px", 
    borderRadius: "20px", 
    cursor: "pointer",
    fontSize: "13px"
  },
  
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { fontWeight: "bold", fontSize: "14px", color: "#aaa", marginBottom: "-5px" },
  
  input: { 
    padding: "12px", 
    borderRadius: "8px", 
    border: "1px solid rgba(255,255,255,0.1)", 
    background: "rgba(0,0,0,0.3)", 
    color: "white",
    fontSize: "16px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  },
  
  btn: { 
    padding: "15px", 
    background: "linear-gradient(90deg, #00C853, #69F0AE)", 
    color: "black", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "bold",
    marginTop: "10px",
    boxShadow: "0 5px 15px rgba(0, 200, 83, 0.3)"
  },
  
  statusBox: { 
    background: 'rgba(255,255,255,0.05)', 
    padding: '15px', 
    borderRadius: '10px', 
    marginTop: '10px',
    borderLeft: '4px solid #69F0AE'
  },
  
  listContainer: { maxHeight: '200px', overflowY: 'auto' }
};

export default FinalDelivery;