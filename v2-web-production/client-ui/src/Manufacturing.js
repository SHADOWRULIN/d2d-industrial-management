import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const Manufacturing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <nav style={styles.navbar}>
        <button onClick={() => navigate(`/director/project/${id}`)} style={styles.backBtn}>← Back to Menu</button>
        <h1 style={styles.title}>Manufacturing Operations | <span style={{color:'#E040FB'}}>Proposal #{id}</span></h1>
      </nav>

      {/* Centered Grid Menu */}
      <div style={styles.grid}>
        
        {/* 1. Manufacturing Process (Purple) */}
        <MenuCard 
          title="Manufacturing Process" 
          color="#E040FB" 
          icon="⚙️"
          onClick={() => navigate(`/director/project/${id}/manufacturing/process`)}
        />
        
        {/* 2. Warehouse & Inventory (Teal) */}
        <MenuCard 
          title="Warehouse & Inventory" 
          color="#64FFDA" 
          icon="📦"
          onClick={() => navigate(`/director/project/${id}/manufacturing/warehouse`)}
        />
        
        {/* 3. Workers & Labor (Orange) */}
        <MenuCard 
          title="Workers & Labor" 
          color="#FFAB40" 
          icon="👷"
          onClick={() => navigate(`/director/project/${id}/manufacturing/workers`)}
        />

      </div>
    </div>
  );
};

// Reusable Glass Card
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

// --- PREMIUM DARK STYLES ---
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
    fontSize: "14px",
    transition: "all 0.3s"
  },
  
  title: { margin: 0, fontSize: "24px", color: "white", letterSpacing: "1px" },

  grid: { 
    display: "flex", 
    flexWrap: "wrap",           
    justifyContent: "center",   
    gap: "40px", 
    padding: "60px 20px", 
    maxWidth: "1200px", 
    width: "100%",
    boxSizing: "border-box"
  },
  
  card: { 
    background: "rgba(255, 255, 255, 0.05)", 
    width: "300px", 
    height: "220px", 
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
  
  icon: { fontSize: "50px", marginBottom: "15px" },
  cardText: { fontSize: "22px", fontWeight: "bold", margin: 0, letterSpacing: "0.5px" }
};

export default Manufacturing;