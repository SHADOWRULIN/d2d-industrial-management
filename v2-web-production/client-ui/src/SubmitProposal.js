import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SubmitProposal = () => {
  const navigate = useNavigate();
  const clientId = localStorage.getItem("client_id");

  const [formData, setFormData] = useState({ project_name: "", description: "", service: "Product Design" });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Sending...");

    const data = new FormData();
    data.append("client_id", clientId);
    data.append("project_name", formData.project_name);
    data.append("description", formData.description);
    data.append("service", formData.service);
    if (file) data.append("image", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/proposals/create", data, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        alert("Proposal Submitted Successfully!");
        navigate("/dashboard");
      } else {
        setMessage("Error submitting proposal.");
      }
    } catch (error) {
      setMessage("Server error. Try again.");
    }
  };

  return (
    <div style={styles.container}>
      <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="/poster1.jpg" 
          style={styles.videoBackground}
        >
          <source src="/background1.mp4" type="video/mp4" />
        </video>
      <div style={styles.overlay}></div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        style={styles.card}
      >
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>← Back</button>
        <h2 style={styles.title}>New Project Proposal</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Project Name</label>
          <input type="text" name="project_name" onChange={handleChange} style={styles.input} required placeholder="e.g. Smart Drone"/>

          <label style={styles.label}>Description</label>
          <textarea name="description" onChange={handleChange} style={{...styles.input, height: '100px', resize: 'none'}} required placeholder="Describe your idea..."/>

          <label style={styles.label}>Service Needed</label>
          <select name="service" onChange={handleChange} style={styles.input}>
            <option>Product Design</option>
            <option>Prototyping</option>
            <option>Manufacturing</option>
          </select>

          <label style={styles.label}>Reference Image (Optional)</label>
          <div style={styles.fileBox}>
             <input type="file" onChange={handleFileChange} style={{color: 'white'}} />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            style={styles.submitBtn} 
            type="submit"
          >
            Submit Proposal 🚀
          </motion.button>
        </form>
        {message && <p style={{color: '#FF5252', marginTop: '10px', textAlign: 'center'}}>{message}</p>}
      </motion.div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", position: "relative", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Segoe UI', sans-serif" },
  videoBackground: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -2 },
  overlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", zIndex: -1 },
  
  card: { background: "rgba(30, 30, 30, 0.6)", backdropFilter: "blur(15px)", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "600px", border: "1px solid rgba(255,255,255,0.1)", color: "white", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" },
  backBtn: { background: "transparent", border: "none", cursor: "pointer", color: "#aaa", marginBottom: "20px", fontSize: "14px" },
  title: { color: "#ffffffff", marginBottom: "30px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px", fontSize: '24px' },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { fontWeight: "bold", color: "#FFAB40", marginBottom: "-10px", fontSize: "12px", textTransform: 'uppercase' },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "#000000ff", color: "white", fontSize: "15px", outline: 'none' },
  fileBox: { padding: "15px", border: "1px dashed #444", borderRadius: "8px", textAlign: "center", background: "rgba(0,0,0,0.2)" },
  submitBtn: { padding: "15px", background: "linear-gradient(90deg, #FFAB40, #FF6D00)", color: "black", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }
};

export default SubmitProposal;