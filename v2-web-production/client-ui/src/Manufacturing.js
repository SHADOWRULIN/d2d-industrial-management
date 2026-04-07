import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const Manufacturing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const dynamicNavbar = {
    ...styles.navbar,
    flexDirection: isMobile ? "column" : "row",
    padding: isMobile ? "15px" : "20px 40px",
    gap: isMobile ? "15px" : "0px",
    textAlign: "center"
  };

  const dynamicTitle = {
    ...styles.title,
    fontSize: isMobile ? "18px" : "24px"
  };

  const dynamicGrid = {
    ...styles.grid,
    gap: isMobile ? "20px" : "40px",
    padding: isMobile ? "30px 15px" : "60px 20px"
  };

  return (
    <div style={styles.container}>
      <nav style={dynamicNavbar}>
        <button onClick={() => navigate(`/director/project/${id}`)} style={styles.backBtn}>← Back</button>
        <h1 style={dynamicTitle}>Manufacturing Operations | <span style={{color:'#E040FB'}}>Proposal #{id}</span></h1>
      </nav>

      <div style={dynamicGrid}>
        <MenuCard 
          title="Manufacturing Process" 
          color="#E040FB" 
          icon="⚙️"
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/manufacturing/process`)}
        />
        
        <MenuCard 
          title="Warehouse & Inventory" 
          color="#64FFDA" 
          icon="📦"
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/manufacturing/warehouse`)}
        />
        
        <MenuCard 
          title="Workers & Labor" 
          color="#FFAB40" 
          icon="👷"
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/manufacturing/workers`)}
        />
      </div>
    </div>
  );
};

const MenuCard = ({ title, color, icon, onClick, isMobile }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)", translateY: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{
      ...styles.card, 
      borderTop: `4px solid ${color}`,
      width: isMobile ? "100%" : "300px",
      height: isMobile ? "180px" : "220px"
    }}
  >
    <div style={{...styles.icon, fontSize: isMobile ? "40px" : "50px", textShadow: `0 0 15px ${color}`}}>{icon}</div>
    <h3 style={{...styles.cardText, fontSize: isMobile ? "18px" : "22px", color: color}}>{title}</h3>
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
    padding: "8px 20px", 
    borderRadius: "30px", 
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s"
  },
  title: { margin: 0, color: "white", letterSpacing: "1px" },
  grid: { 
    display: "flex", 
    flexWrap: "wrap",           
    justifyContent: "center",   
    maxWidth: "1200px", 
    width: "100%",
    boxSizing: "border-box"
  },
  card: { 
    background: "rgba(255, 255, 255, 0.05)", 
    borderRadius: "20px", 
    border: "1px solid rgba(255, 255, 255, 0.1)", 
    display: "flex", 
    flexDirection: "column",
    justifyContent: "center", 
    alignItems: "center", 
    cursor: "pointer", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    transition: "all 0.3s ease",
    boxSizing: "border-box"
  },
  icon: { marginBottom: "15px" },
  cardText: { fontWeight: "bold", margin: 0, letterSpacing: "0.5px", textAlign: "center" }
};

export default Manufacturing;