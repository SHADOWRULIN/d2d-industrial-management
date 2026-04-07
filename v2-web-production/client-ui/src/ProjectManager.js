import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const ProjectManager = () => {
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
    textAlign: "center",
  };

  const dynamicTitle = {
    ...styles.title,
    fontSize: isMobile ? "18px" : "24px",
  };

  const dynamicGrid = {
    ...styles.grid,
    gap: isMobile ? "15px" : "30px",
    padding: isMobile ? "20px 10px" : "40px 20px",
  };

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <nav style={dynamicNavbar}>
        <button onClick={() => navigate("/director/dashboard")} style={styles.backBtn}>← Back</button>
        <h1 style={dynamicTitle}>
          Project Management | <span style={{color:'#4FC3F7'}}>Proposal #{id}</span>
        </h1>
      </nav>

      {/* Centered Grid Menu */}
      <div style={dynamicGrid}>
        
        <MenuCard 
          title="Update Status" 
          icon="📊"
          color="#64FFDA" 
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/status`)}
        />
        
        <MenuCard 
          title="Accounts Dept" 
          icon="💳"
          color="#448AFF" 
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/accounts`)}
        />

        <MenuCard 
          title="Vendor Mgmt" 
          icon="🏗️"
          color="#FFAB40" 
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/vendor`)}
        />
        
        <MenuCard 
          title="Manufacturing" 
          icon="⚙️"
          color="#E040FB" 
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/manufacturing`)}
        />

        <MenuCard 
          title="Delivery" 
          icon="🚚"
          color="#69F0AE" 
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/delivery`)}
        />

        <MenuCard 
          title="Client Feedback" 
          icon="⭐"
          color="#FF5252" 
          isMobile={isMobile}
          onClick={() => navigate(`/director/project/${id}/feedback`)}
        />
      </div>
    </div>
  );
};

// Reusable Glass Card Component
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
        width: isMobile ? "calc(50% - 15px)" : "250px",
        height: isMobile ? "160px" : "200px",
        minWidth: isMobile ? "140px" : "250px"
    }}
  >
    <div style={{
        ...styles.icon, 
        fontSize: isMobile ? "35px" : "45px",
        textShadow: `0 0 15px ${color}`
    }}>{icon}</div>
    <h3 style={{
        ...styles.cardText, 
        color: color,
        fontSize: isMobile ? "16px" : "20px"
    }}>{title}</h3>
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
    fontSize: "14px"
  },
  title: { margin: 0, color: "white", letterSpacing: "1px", fontWeight: "600" },
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
  icon: { marginBottom: "10px" },
  cardText: { fontWeight: "bold", margin: 0, textAlign: "center" }
};

export default ProjectManager;