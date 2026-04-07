import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const Feedback = () => {
  const navigate = useNavigate();
  const clientId = localStorage.getItem("client_id");
  const [proposals, setProposals] = useState([]);
  const [formData, setFormData] = useState({ proposal_id: "", rating: 0, comments: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/client/proposals/${clientId}`)
      .then(res => setProposals(res.data))
      .catch(err => console.error("Error fetching projects"));
  }, [clientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.proposal_id || formData.rating === 0) return alert("Please select a project and rating.");
    try {
      await axios.post(`${API_BASE_URL}/api/client/feedback`, formData);
      alert("Thank you!");
      navigate("/dashboard");
    } catch (error) { alert("Error sending feedback."); }
  };

  const isMobile = windowWidth < 600;

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
          <source src="https://res.cloudinary.com/dzdyhltkt/video/upload/f_auto,q_auto/v1775587563/background1_flsxzl.mp4" type="video/mp4" />
        </video>
      <div style={styles.overlay}></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        style={{
            ...styles.card,
            width: isMobile ? "90%" : "500px",
            padding: isMobile ? "25px" : "40px"
        }}
      >
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>← Back</button>
        <h2 style={{...styles.title, fontSize: isMobile ? "22px" : "28px"}}>Rate Your Experience</h2>
        <p style={styles.subtitle}>Help us improve by rating a completed project.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Select Project</label>
          <select style={styles.input} onChange={(e) => setFormData({...formData, proposal_id: e.target.value})} required>
            <option value="">-- Choose a Project --</option>
            {proposals.map(p => <option key={p.proposal_id} value={p.proposal_id}>{p.project_name}</option>)}
          </select>

          <label style={styles.label}>Rating</label>
          <div style={{...styles.stars, fontSize: isMobile ? "30px" : "35px"}}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} style={{...styles.star, color: star <= (hoverRating || formData.rating) ? "#FFD700" : "#555"}}
                onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setFormData({...formData, rating: star})}>★</span>
            ))}
          </div>

          <label style={styles.label}>Comments</label>
          <textarea style={{...styles.input, height: '100px'}} onChange={(e) => setFormData({...formData, comments: e.target.value})} required placeholder="Your thoughts..." />

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={styles.submitBtn}>Submit Feedback</motion.button>
        </form>
      </motion.div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", position: "relative", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Segoe UI', sans-serif", overflow: "hidden", padding: "20px" },
  videoBackground: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -2 },
  overlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", zIndex: -1 },
  
  card: { background: "rgba(30, 30, 30, 0.6)", backdropFilter: "blur(15px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center", color: "white", boxSizing: "border-box" },
  backBtn: { background: "none", border: "none", cursor: "pointer", float: "left", fontSize: "16px", color: "#aaa" },
  title: { color: "#ffffffff", margin: "10px 0", textAlign: "center", width: "100%", clear: "both" },
  subtitle: { color: "#ccc", marginBottom: "20px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "15px", textAlign: "left" },
  label: { fontWeight: "bold", color: "#ddd", fontSize: "14px" },
  input: { padding: "12px", borderRadius: "8px", border: "none", fontSize: "16px", background: "rgba(0, 0, 0, 1)", color: "white", width: "100%", boxSizing: "border-box" },
  stars: { display: "flex", gap: "5px", cursor: "pointer", justifyContent: "center" },
  submitBtn: { padding: "15px", background: "linear-gradient(90deg, #FFD740, #FFAB00)", color: "black", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }
};

export default Feedback;