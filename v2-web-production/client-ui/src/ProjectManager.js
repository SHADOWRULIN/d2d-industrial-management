import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const ProjectManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <nav style={styles.navbar}>
        <button onClick={() => navigate("/director/dashboard")} style={styles.backBtn}>← Back to Dashboard</button>
        <h1 style={styles.title}>Project Management | <span style={{color:'#4FC3F7'}}>Proposal #{id}</span></h1>
      </nav>

      {/* Centered Grid Menu */}
      <div style={styles.grid}>
        
        <MenuCard 
          title="Update Status" 
          icon="📊"
          color="#64FFDA" 
          onClick={() => navigate(`/director/project/${id}/status`)}
        />
        
        <MenuCard 
          title="Accounts Dept" 
          icon="💳"
          color="#448AFF" 
          onClick={() => navigate(`/director/project/${id}/accounts`)}
        />

        <MenuCard 
          title="Vendor Mgmt" 
          icon="🏗️"
          color="#FFAB40" 
          onClick={() => navigate(`/director/project/${id}/vendor`)}
        />
        
        <MenuCard 
          title="Manufacturing" 
          icon="⚙️"
          color="#E040FB" 
          onClick={() => navigate(`/director/project/${id}/manufacturing`)}
        />

        <MenuCard 
          title="Delivery" 
          icon="🚚"
          color="#69F0AE" 
          onClick={() => navigate(`/director/project/${id}/delivery`)}
        />

        {/* 👇 NEW TILE: CLIENT FEEDBACK 👇 */}
        <MenuCard 
          title="Client Feedback" 
          icon="⭐"
          color="#FF5252" // Red accent for visibility
          onClick={() => navigate(`/director/project/${id}/feedback`)}
        />
      </div>
    </div>
  );
};

// Reusable Glass Card Component
const MenuCard = ({ title, color, icon, onClick }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)", translateY: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{...styles.card, borderTop: `4px solid ${color}`}}
  >
    <div style={{...styles.icon, textShadow: `0 0 15px ${color}`}}>{icon}</div>
    <h3 style={{...styles.cardText, color: color}}>{title}</h3>
  </motion.div>
);

const styles = {
  container: { 
    minHeight: "100vh", 
    background: "#121212", 
    fontFamily: "'Segoe UI', sans-serif",
    display: "flex", 
    flexDirection: "column",
    alignItems: "center",
    overflowX: "hidden", 
    width: "100vw",      
    boxSizing: "border-box"
  },
  navbar: { 
    width: "100%",
    padding: "20px 40px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    background: "rgba(30, 30, 30, 0.8)", 
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #333",
    position: "sticky",
    top: 0,
    zIndex: 10,
    boxSizing: "border-box" 
  },
  backBtn: { 
    background: "rgba(255,255,255,0.1)", 
    border: "1px solid rgba(255,255,255,0.2)", 
    color: "white", 
    padding: "10px 20px", 
    borderRadius: "30px", 
    cursor: "pointer",
    fontSize: "14px"
  },
  title: { margin: 0, fontSize: "24px", color: "white", letterSpacing: "1px" },
  grid: { 
    display: "flex", 
    flexWrap: "wrap",           
    justifyContent: "center",   
    gap: "30px", 
    padding: "40px 20px", 
    maxWidth: "1200px", 
    width: "100%",
    boxSizing: "border-box" 
  },
  card: { 
    background: "rgba(255, 255, 255, 0.05)", 
    width: "250px", 
    height: "200px", 
    borderRadius: "20px", 
    border: "1px solid rgba(255, 255, 255, 0.1)", 
    display: "flex", 
    flexDirection: "column",
    justifyContent: "center", 
    alignItems: "center", 
    cursor: "pointer", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    transition: "all 0.3s ease"
  },
  icon: { fontSize: "45px", marginBottom: "10px" },
  cardText: { fontSize: "20px", fontWeight: "bold", margin: 0 }
};

export default ProjectManager;