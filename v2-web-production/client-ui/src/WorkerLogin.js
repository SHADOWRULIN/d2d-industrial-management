import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const WorkerLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState(""); // Added message state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/worker/login", formData);
      if (res.data.success) {
        localStorage.setItem("worker_auth", "true");
        localStorage.setItem("worker_id", res.data.worker_id);
        localStorage.setItem("worker_name", res.data.name);
        navigate("/worker/dashboard");
      } else {
        setMessage("❌ " + res.data.message);
      }
    } catch (err) { 
        // 🟢 Specific Error Handling
        if (err.response && err.response.data) {
            setMessage("❌ " + err.response.data.message);
        } else {
            setMessage("⚠️ Server connection failed.");
        }
    }
  };

  return (
    <div style={styles.container}>
      <img src="/back2.jpg" alt="Worker Background" style={styles.backgroundImage} />
      <div style={styles.overlay}></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <button onClick={() => navigate("/")} style={styles.backBtn}>← Back</button>

        <h2 style={styles.title}>Worker Portal</h2>
        <p style={styles.subtitle}>Authorized Personnel Only.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            style={styles.input} 
            placeholder="Worker Username" 
            onChange={e => setFormData({...formData, username: e.target.value})} 
            required
          />
          <input 
            type="password" 
            style={styles.input} 
            placeholder="Password" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required
          />
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.95 }}
            style={styles.btn}
          >
            Login to Workspace 🛠️
          </motion.button>
        </form>

        {/* 🟢 ERROR MESSAGE DISPLAY */}
        {message && <p style={styles.error}>{message}</p>}

      </motion.div>
    </div>
  );
};

const styles = {
  container: { height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", fontFamily: "'Segoe UI', sans-serif", background: "#121212" },
  backgroundImage: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, opacity: 0.6 },
  overlay: { position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.75)", zIndex: 1 },
  card: { position: "relative", zIndex: 2, background: "rgba(30, 30, 30, 0.6)", backdropFilter: "blur(15px)", padding: "50px", borderRadius: "20px", width: "400px", border: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "center", color: "white", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" },
  backBtn: { background: "none", border: "none", color: "#aaa", cursor: "pointer", float: "left", fontSize: "14px", transition: "color 0.3s", marginBottom: "15px" },
  title: { margin: "10px 0", fontSize: "32px", fontWeight: "700", letterSpacing: "1px", width: "100%", clear: "both", color: "#FFAB40" },
  subtitle: { color: "#aaa", marginBottom: "30px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  input: { padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", outline: "none", background: "rgba(0, 0, 0, 0.5)", color: "white", fontSize: "15px", transition: "border 0.3s" },
  btn: { padding: "16px", borderRadius: "8px", border: "none", background: "linear-gradient(90deg, #FF6D00, #FFAB40)", color: "black", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", boxShadow: "0 5px 15px rgba(255, 171, 64, 0.4)", transition: "all 0.3s" },
  error: { background: "rgba(255, 82, 82, 0.1)", border: "1px solid #FF5252", color: "#FF5252", padding: "10px", borderRadius: "5px", marginTop: "20px", fontSize: "13px" }
};

export default WorkerLogin;