import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./apiConfig";


const Delivery = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data State
  const [workers, setWorkers] = useState([]);
  const [pipeline, setPipeline] = useState({
      stage: "Pending", // Options: Pending, Packed, Delivered
      packer_id: "",
      packing_date: "",
      address: "",
      tracking_id: ""
  });
  
  // Loading State
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
        // 1. Fetch Workers for dropdown
        const workerRes = await axios.get(`${API_BASE_URL}/api/director/workers/0`);
        setWorkers(workerRes.data);

        // 2. Fetch Current Pipeline Status
        const statusRes = await axios.get(`${API_BASE_URL}/api/director/logistics/${id}`);
        if(statusRes.data) {
            setPipeline(statusRes.data);
        }
    } catch (err) { console.log("No existing logistics data, starting fresh."); }
    finally { setLoading(false); }
  };

    // Load Data
  useEffect(() => {
    fetchData();
  }, [id]);

  // --- HANDLERS ---

  const handlePackingSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/director/logistics/pack`, {
            proposal_id: id,
            packer_id: pipeline.packer_id,
            packing_date: pipeline.packing_date
        });
        alert("✅ Items Packed! Moving to Delivery Stage.");
        fetchData(); // Refresh to update UI
    } catch (err) { alert("Error saving packing info"); }
  };

  const handleFinalDelivery = async (e) => {
    e.preventDefault();
    if(!window.confirm("Confirm Delivery? This will mark the Project as COMPLETED.")) return;

    try {
        await axios.post(`${API_BASE_URL}/api/director/logistics/complete`, {
            proposal_id: id,
            address: pipeline.address,
            tracking_id: pipeline.tracking_id
        });
        alert("🚀 Project Delivered & Closed Successfully!");
        navigate(`/director/project/${id}`); // Go back to project menu
    } catch (err) { alert("Error completing delivery"); }
  };

  if(loading) return <div style={{color:'white', padding:'40px'}}>Loading Pipeline...</div>;

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <nav style={styles.navbar}>
        <button onClick={() => navigate(`/director/project/${id}`)} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>Logistics Pipeline | <span style={{color:'#69F0AE'}}>#{id}</span></h1>
      </nav>

      <div style={styles.mainContent}>
        
        {/* VISUAL PROGRESS BAR */}
        <div style={styles.progressContainer}>
            <div style={styles.stepActive}>1. Manufacturing (Done)</div>
            <div style={styles.line}></div>
            <div style={pipeline.stage !== 'Pending' ? styles.stepActive : styles.stepInactive}>2. Packed</div>
            <div style={styles.line}></div>
            <div style={pipeline.stage === 'Delivered' ? styles.stepFinished : styles.stepInactive}>3. Delivered</div>
        </div>

        <div style={styles.grid}>
            
            {/* CARD 1: PACKING (Stage 1) */}
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={styles.card}>
                <div style={styles.cardHeader}>
                    <span style={{fontSize:'30px'}}>📦</span>
                    <h3>Stage 1: Packing</h3>
                </div>
                
                {pipeline.stage !== "Pending" ? (
                    <div style={styles.completedBox}>
                        <div style={{fontSize:'18px', marginBottom:'5px'}}>✅ Packed</div>
                        <div style={{fontSize:'12px', color:'#ccc'}}>By ID #{pipeline.packer_id} on {pipeline.packing_date}</div>
                    </div>
                ) : (
                    <form onSubmit={handlePackingSubmit} style={styles.form}>
                        <label style={styles.label}>Assign Packer</label>
                        <select 
                            style={styles.input} 
                            required 
                            value={pipeline.packer_id}
                            onChange={e => setPipeline({...pipeline, packer_id: e.target.value})}
                        >
                            <option value="">-- Select Staff --</option>
                            {workers.map(w => <option key={w.worker_id} value={w.worker_id}>{w.worker_name}</option>)}
                        </select>

                        <label style={styles.label}>Packing Date</label>
                        <input 
                            type="date" 
                            style={styles.input} 
                            required 
                            value={pipeline.packing_date}
                            onChange={e => setPipeline({...pipeline, packing_date: e.target.value})} 
                        />

                        <button style={styles.btnPrimary}>Confirm Packing 🔒</button>
                    </form>
                )}
            </motion.div>

            {/* ARROW */}
            <div style={{fontSize:'40px', color:'#333'}}>➜</div>

            {/* CARD 2: DELIVERY (Stage 2) */}
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{...styles.card, opacity: pipeline.stage === "Pending" ? 0.5 : 1}}>
                <div style={styles.cardHeader}>
                    <span style={{fontSize:'30px'}}>🚚</span>
                    <h3>Stage 2: Final Handover</h3>
                </div>

                {pipeline.stage === "Pending" ? (
                    <div style={styles.lockedMsg}>⚠ Complete Packing First</div>
                ) : pipeline.stage === "Delivered" ? (
                    <div style={styles.completedBox}>
                        <div style={{fontSize:'18px', marginBottom:'5px'}}>🚀 Delivered</div>
                        <div style={{fontSize:'12px', color:'#ccc'}}>To: {pipeline.address}</div>
                    </div>
                ) : (
                    <form onSubmit={handleFinalDelivery} style={styles.form}>
                        <label style={styles.label}>Destination Address</label>
                        <textarea 
                            style={styles.input} 
                            placeholder="Client delivery address..." 
                            required 
                            value={pipeline.address}
                            onChange={e => setPipeline({...pipeline, address: e.target.value})}
                        />

                        <label style={styles.label}>Tracking ID (Optional)</label>
                        <input 
                            style={styles.input} 
                            placeholder="e.g. TCS-123456" 
                            value={pipeline.tracking_id}
                            onChange={e => setPipeline({...pipeline, tracking_id: e.target.value})}
                        />

                        <button style={styles.btnSuccess}>Mark Delivered & Close Project 🏁</button>
                    </form>
                )}
            </motion.div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#121212", fontFamily: "'Segoe UI', sans-serif", color:'white' },
  navbar: { padding: "20px 40px", display: "flex", justifyContent: "space-between", background: "#1a1a1a", borderBottom: "1px solid #333" },
  backBtn: { background: "rgba(255,255,255,0.1)", border: "1px solid #444", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer" },
  title: { margin: 0, fontSize: "20px" },
  
  mainContent: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' },
  
  progressContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '50px', gap: '15px' },
  stepActive: { fontWeight: 'bold', fontSize: '14px', color: '#FFAB40' },
  stepInactive: { fontWeight: 'bold', fontSize: '14px', color: '#555' },
  stepFinished: { fontWeight: 'bold', fontSize: '14px', color: '#00E676' },
  line: { width: '60px', height: '2px', background: '#333' },

  grid: { display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  
  card: { background: "#1e1e1e", width: "380px", minHeight: "380px", padding: "30px", borderRadius: "15px", border: "1px solid #333", display:'flex', flexDirection:'column' },
  cardHeader: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' },
  input: { padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: 'white', borderRadius: '8px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  
  btnPrimary: { padding: '15px', background: '#FFAB40', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  btnSuccess: { padding: '15px', background: '#00E676', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },

  completedBox: { background: 'rgba(0, 230, 118, 0.1)', color: '#00E676', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #00E676', fontWeight: 'bold', marginTop: 'auto', marginBottom: 'auto' },
  lockedMsg: { padding: '20px', textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: 'auto', marginBottom: 'auto' }
};

export default Delivery;