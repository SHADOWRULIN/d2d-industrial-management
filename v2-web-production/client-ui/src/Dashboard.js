import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const clientName = localStorage.getItem("client_name") || "Client";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.container}>
      
      {/* 🎥 BACKGROUND LAYER */}
      <div style={styles.videoWrapper}>
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
      </div>

      {/* 🚀 UI LAYER */}
      <div style={styles.uiContent}>
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={styles.navbar}
        >
          <h2 style={styles.logo}>🚀 Client Portal</h2>
          <div style={styles.navRight}>
            <span style={styles.welcome}>Welcome, <span style={{color: '#4FC3F7'}}>{clientName}</span></span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </motion.nav>

        <div style={styles.grid}>
          <ActionCard 
              title="Submit Proposal" 
              desc="Start a new project request with us." 
              icon="📝" 
              delay={0.05}
              color="#4FC3F7" 
              onClick={() => navigate("/submit-proposal")} 
          />

          <ActionCard 
            title="Track Inquiries" 
            desc="Check the status of your ongoing projects." 
            icon="🔍" 
            delay={0.1}
            color="#69F0AE" 
            onClick={() => navigate("/inquiry")}
          />
          
          <ActionCard 
            title="Give Feedback" 
            desc="Rate your completed projects." 
            icon="⭐" 
            delay={0.15}
            color="#FFD740" 
            onClick={() => navigate("/feedback")} 
          />
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ title, desc, icon, delay, onClick, color }) => (
  <motion.div 
    layout // Optimized layout transitions
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }} // Use Y-offset instead of scale for smoother blur performance
    whileTap={{ scale: 0.98 }}
    transition={{ 
        delay: delay, 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
    }}
    onClick={onClick}
    style={{...styles.card, borderTop: `3px solid ${color}`}}
  >
    <motion.div 
        initial={{ scale: 0.8 }} 
        animate={{ scale: 1 }} 
        style={{...styles.icon, textShadow: `0 0 10px ${color}`}}
    >
        {icon}
    </motion.div>
    <h3 style={{...styles.cardTitle, color: color}}>{title}</h3>
    <p style={styles.cardDesc}>{desc}</p>
  </motion.div>
);

const styles = {
  container: { 
    minHeight: "100vh", 
    width: "100vw",
    backgroundColor: "#000",
    overflow: "hidden"
  },

  videoWrapper: {
    position: "fixed",
    inset: 0,
    zIndex: 0
  },

  videoBackground: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)",
  },

  uiContent: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh"
  },

  navbar: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "15px 40px", 
    background: "rgba(255, 255, 255, 0.02)", 
    backdropFilter: "blur(8px)", // Reduced blur for better performance
    WebkitBackdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  grid: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    gap: "25px", 
    flexWrap: "wrap", 
    padding: "40px 20px",
    flex: 1
  },

  card: { 
    background: "rgba(255, 255, 255, 0.04)", 
    backdropFilter: "blur(6px)", // Light blur is much smoother during animation
    width: "260px", 
    padding: "30px 20px", 
    borderRadius: "20px", 
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.3)", 
    cursor: "pointer", 
    textAlign: "center",
  },
  
  logo: { margin: 0, fontSize: "20px", color: "white", fontWeight: "700", letterSpacing: "-0.5px" },
  navRight: { display: "flex", alignItems: "center", gap: "20px" },
  welcome: { fontSize: "13px", color: "#aaa" },
  logoutBtn: { 
    padding: "6px 16px", 
    background: "rgba(255, 82, 82, 0.1)", 
    color: "#FF5252", 
    border: "1px solid rgba(255, 82, 82, 0.3)", 
    borderRadius: "15px", 
    cursor: "pointer", 
    fontSize: "12px",
    fontWeight: "600"
  },
  icon: { fontSize: "38px", marginBottom: "10px" },
  cardTitle: { margin: "5px 0", fontSize: "18px", fontWeight: "700" },
  cardDesc: { color: "#777", fontSize: "13px", lineHeight: "1.4" }
};

export default Dashboard;