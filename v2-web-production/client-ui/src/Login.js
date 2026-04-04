import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "", phone: "", email: "", company: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!isLogin) {
        // Phone Validation: Must be numbers only and length of 11
        const phoneRegex = /^[0-9]{11}$/;
        if (!phoneRegex.test(formData.phone)) {
            setMessage("⚠️ Phone number must be exactly 11 digits.");
            return false;
        }
        if (!formData.email.includes("@")) {
            setMessage("⚠️ Invalid email address.");
            return false;
        }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    try {
      const endpoint = isLogin ? "/api/client/login" : "/api/client/signup"; 
      const url = `http://127.0.0.1:5000${endpoint}`;
      
      const response = await axios.post(url, formData);

      if (response.data.success) {
        if (response.data.client_id) {
            localStorage.setItem("client_id", response.data.client_id);
            localStorage.setItem("client_name", response.data.name);
            navigate("/dashboard");
        } else {
             setMessage("✅ Account created! Please log in.");
             setIsLogin(true);
        }
      } else {
        setMessage("❌ " + response.data.message);
      }
    } catch (error) {
      // 🟢 IMPROVED ERROR HANDLING
      if (error.response && error.response.data) {
          setMessage("❌ " + error.response.data.message);
      } else {
          setMessage("⚠️ Server is not reachable. Is backend running?");
      }
    }
  };

  return (
    <div style={styles.container}>
      
      <img src="/poster.jpg" alt="Background" style={styles.backgroundImage} />
      <video autoPlay loop muted playsInline style={styles.videoBackground}>
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div style={styles.overlay}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={styles.card}
      >
        <button onClick={() => navigate("/")} style={styles.backBtn}>← Back</button>

        <h2 style={styles.title}>{isLogin ? "Welcome Back" : "Join the Future"}</h2>
        <p style={styles.subtitle}>{isLogin ? "Access your client dashboard." : "Create an account to start your journey."}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" name="username" placeholder="Username" onChange={handleChange} style={styles.input} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} style={styles.input} required />

          <AnimatePresence>
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={styles.signupGroup}
              >
                <input type="text" name="phone" placeholder="Phone Number (11 digits)" onChange={handleChange} style={styles.input} required />
                <input type="email" name="email" placeholder="Email Address" onChange={handleChange} style={styles.input} required />
                <input type="text" name="company" placeholder="Company Name" onChange={handleChange} style={styles.input} required />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            style={styles.button} 
            type="submit"
          >
            {isLogin ? "Login Now" : "Create Account"}
          </motion.button>
        </form>

        {message && <motion.p initial={{opacity:0}} animate={{opacity:1}} style={styles.error}>{message}</motion.p>}

        <p style={styles.toggleText} onClick={() => { setIsLogin(!isLogin); setMessage(""); }}>
          {isLogin ? "New here? " : "Already a member? "}
          <span style={styles.linkText}>{isLogin ? "Create Account" : "Login"}</span>
        </p>

      </motion.div>
    </div>
  );
};

const styles = {
  container: { height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#121212" },
  backgroundImage: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 },
  videoBackground: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 },
  overlay: { position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.75)", zIndex: 2 },
  card: { position: "relative", zIndex: 3, background: "rgba(30, 30, 30, 0.6)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", padding: "50px", borderRadius: "20px", width: "420px", border: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "center", color: "white", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" },
  backBtn: { background: "none", border: "none", color: "#aaa", cursor: "pointer", float: "left", fontSize: "14px", transition: "color 0.3s", marginBottom: "10px" },
  title: { margin: "10px 0", fontSize: "32px", fontWeight: "700", letterSpacing: "1px", width: "100%", clear: "both" },
  subtitle: { margin: "0 0 30px 0", opacity: 0.6, fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  signupGroup: { display: "flex", flexDirection: "column", gap: "15px", overflow: "hidden" },
  input: { padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", outline: "none", background: "rgba(0, 0, 0, 0.5)", color: "white", fontSize: "15px", transition: "border 0.3s" },
  button: { padding: "16px", borderRadius: "8px", border: "none", background: "linear-gradient(90deg, #D32F2F, #FF5252)", color: "white", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "15px", boxShadow: "0 5px 15px rgba(211, 47, 47, 0.4)", transition: "all 0.3s" },
  toggleText: { marginTop: "25px", fontSize: "14px", color: "#aaa", cursor: 'pointer' },
  linkText: { color: "#FF5252", fontWeight: "bold", textDecoration: "underline" },
  error: { background: "rgba(255, 82, 82, 0.1)", border: "1px solid #FF5252", color: "#FF5252", padding: "10px", borderRadius: "5px", marginTop: "15px", fontSize: "13px" }
};

export default Login;