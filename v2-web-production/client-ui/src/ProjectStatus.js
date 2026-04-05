import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const ProjectStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ workflow_status: "Design", start_date: "", end_date: "" });
  const [files, setFiles] = useState({ design_pdf: null, detail_pdf: null });

  useEffect(() => {
    if (!localStorage.getItem("director_auth")) navigate("/director");
    axios.get(`${API_BASE_URL}/api/director/project/${id}`)
      .then(res => {
        setFormData({
            workflow_status: res.data.workflow_status || "Design",
            start_date: res.data.start_date || "",
            end_date: res.data.end_date || ""
        });
      })
      .catch(err => console.error(err));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("proposal_id", id);
    data.append("workflow_status", formData.workflow_status);
    data.append("start_date", formData.start_date);
    data.append("end_date", formData.end_date);
    if (files.design_pdf) data.append("design_pdf", files.design_pdf);
    if (files.detail_pdf) data.append("detail_pdf", files.detail_pdf);

    try {
      await axios.post(`${API_BASE_URL}/api/director/update_project`, data);
      alert("✅ Status Updated Successfully!");
      navigate(`/director/project/${id}`);
    } catch (error) {
      alert("Error updating project.");
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        style={styles.card}
      >
        <button onClick={() => navigate(`/director/project/${id}`)} style={styles.backBtn}>← Back to Menu</button>
        <h2 style={styles.title}>Update Status | <span style={{color:'#64FFDA'}}>Project #{id}</span></h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Current Workflow Stage</label>
          <select 
            style={styles.input} 
            value={formData.workflow_status} 
            onChange={(e) => setFormData({...formData, workflow_status: e.target.value})}
          >
            <option>Design</option>
            <option>Manufacturing</option>
            <option>Assembling</option>
            <option>Packing</option>
            <option>Delivery</option>
            <option>Completed</option>
          </select>

          <div style={styles.row}>
            <div style={{flex: 1}}>
                <label style={styles.label}>Start Date: </label>
                <input type="date" style={styles.input} value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div style={{flex: 1}}>
                <label style={styles.label}>End Date: </label>
                <input type="date" style={styles.input} value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>

          <label style={styles.label}>Upload Design PDF</label>
          <div style={styles.fileBox}>
            <input type="file" accept=".pdf" onChange={(e) => setFiles({...files, design_pdf: e.target.files[0]})} style={{color: 'white'}} />
          </div>
          
          <label style={styles.label}>Upload Detail PDF</label>
          <div style={styles.fileBox}>
            <input type="file" accept=".pdf" onChange={(e) => setFiles({...files, detail_pdf: e.target.files[0]})} style={{color: 'white'}} />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            style={styles.saveBtn}
          >
            Save Changes 💾
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// --- PREMIUM DARK STYLES ---
const styles = {
  container: { 
    minHeight: "100vh", 
    background: "#121212", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    fontFamily: "'Segoe UI', sans-serif" 
  },
  
  card: { 
    background: "rgba(255, 255, 255, 0.05)", 
    backdropFilter: "blur(10px)",
    padding: "40px", 
    borderRadius: "20px", 
    width: "600px", 
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    color: "white"
  },
  
  backBtn: { 
    background: "transparent", 
    border: "1px solid rgba(255,255,255,0.3)", 
    borderRadius: "20px",
    padding: "8px 15px",
    cursor: "pointer", 
    fontSize: "14px", 
    marginBottom: "20px", 
    color: "#ccc",
    transition: "all 0.3s"
  },
  
  title: { 
    margin: "0 0 25px 0", 
    fontSize: "24px", 
    borderBottom: "1px solid rgba(255,255,255,0.1)", 
    paddingBottom: "15px" 
  },
  
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  
  label: { fontWeight: "bold", fontSize: "14px", color: "#aaa", marginBottom: "-10px" },
  
  input: { 
    padding: "12px", 
    borderRadius: "8px", 
    border: "1px solid #444", 
    background: "#222", 
    color: "white",
    fontSize: "16px",
    outline: "none"
  },
  
  row: { display: "flex", gap: "20px" },
  
  fileBox: { 
    padding: "15px", 
    background: "rgba(0,0,0,0.2)", 
    border: "1px dashed rgba(255,255,255,0.3)",
    borderRadius: "8px"
  },
  
  saveBtn: { 
    padding: "15px", 
    background: "linear-gradient(90deg, #00C853, #69F0AE)", 
    color: "black", 
    border: "none", 
    borderRadius: "8px", 
    fontSize: "16px", 
    fontWeight: "bold", 
    cursor: "pointer", 
    marginTop: "10px",
    boxShadow: "0 5px 15px rgba(0, 200, 83, 0.3)"
  }
};

export default ProjectStatus;