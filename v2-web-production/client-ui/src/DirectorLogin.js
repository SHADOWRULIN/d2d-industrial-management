import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DirectorLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/director/login", formData);
      if (response.data.success) {
        localStorage.setItem("director_auth", "true");
        navigate("/director/dashboard");
      } else {
        setMessage("❌ " + response.data.message);
      }
    } catch (error) {
        // 🟢 Specific Error Handling
        if (error.response && error.response.data) {
            setMessage("❌ " + error.response.data.message);
        } else {
            setMessage("⚠️ Server connection failed.");
        }
    }
  };

  return (
    <div style={styles.container}>
      <img src="/back1.jpg" alt="Background" style={styles.backgroundImage} />
      <div style={styles.overlay}></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <button onClick={() => navigate("/")} style={styles.backBtn}>← Back</button>
        
        <h2 style={styles.title}>Director Access</h2>
        <p style={styles.subtitle}>Restricted Area. Authorized Personnel Only.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" name="username" placeholder="Admin Username" onChange={handleChange} style={styles.input} required />
          <input type="password" name="password" placeholder="Admin Password" onChange={handleChange} style={styles.input} required />

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.95 }} 
            style={styles.button} 
            type="submit"
          >
            Access Dashboard 🔐
          </motion.button>
        </form>

        {message && <p style={styles.error}>{message}</p>}
      </motion.div>
    </div>
  );
};

const styles = {
  container: { height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", fontFamily: "'Segoe UI', sans-serif", background: "#121212" },
  backgroundImage: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, opacity: 0.6 },
  overlay: { position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.7)", zIndex: 1 },
  card: { position: "relative", zIndex: 2, background: "rgba(30, 30, 30, 0.6)", backdropFilter: "blur(15px)", padding: "50px", borderRadius: "20px", width: "420px", border: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "center", color: "white", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" },
  backBtn: { background: "none", border: "none", color: "#aaa", cursor: "pointer", float: "left", fontSize: "14px", transition: "color 0.3s" },
  title: { margin: "10px 0", fontSize: "32px", fontWeight: "700", letterSpacing: "1px", width: "100%", clear: "both" },
  subtitle: { color: "#aaa", marginBottom: "30px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  input: { padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", outline: "none", background: "rgba(0, 0, 0, 0.5)", color: "white", fontSize: "15px", transition: "border 0.3s" },
  button: { padding: "16px", borderRadius: "8px", border: "none", background: "linear-gradient(90deg, #D32F2F, #FF5252)", color: "white", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", boxShadow: "0 5px 15px rgba(211, 47, 47, 0.4)" },
  error: { background: "rgba(255, 82, 82, 0.1)", border: "1px solid #FF5252", color: "#FF5252", padding: "10px", borderRadius: "5px", marginTop: "20px", fontSize: "13px" }
};

export default DirectorLogin;