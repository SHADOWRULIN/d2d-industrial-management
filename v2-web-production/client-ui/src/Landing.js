import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      {/* 🖼️ HOLD/FALLBACK IMAGE (Layer 0) */}
      {/* This shows immediately if the video is slow or fails */}
      <img 
        src="/poster.jpg" 
        alt="Engineering Background" 
        style={styles.backgroundImage} 
      />

      {/* 🎥 VIDEO BACKGROUND (Layer 1) */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        poster="/poster.jpg" // Extra backup
        style={styles.videoBackground}
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      
      {/* 🌑 DARK OVERLAY (Layer 2) */}
      <div style={styles.overlay}></div>

      {/* 🔹 HEADER (Layer 3) */}
      <nav style={styles.navbar}>
        <div style={styles.logoContainer}>
            <h2 style={styles.logoText}>MECH<span style={{color: '#ff0000ff'}}>X</span></h2>
        </div>

        <a href="https://mechx.com.pk/" target="_blank" rel="noopener noreferrer" style={styles.websiteBtn}>
            Visit Official Website ↗
        </a>
      </nav>

      {/* 🔹 HERO CONTENT (Layer 3) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        style={styles.content}
      >
        <h1 style={styles.title}>Engineering Excellence</h1>
        
        <p style={styles.aboutText}>
          Industry professionals from specialized and commercial domains with vision to provide diverse design and manufacturing solutions with focus on quality practices.
          We excel in mechanical designs that are locally manufacturable, achieving required functionality and aesthetics.
          We provide end to end manufacturing solutions that give our clients a stress free experience.
        </p>

        <p style={styles.subtitle}>Select your portal to login:</p>

        <div style={styles.grid}>
          <RoleCard 
            title="Client" 
            desc="Submit proposals & track status" 
            color="#4FC3F7" 
            icon="🤝"
            onClick={() => navigate("/login/client")} 
          />

          <RoleCard 
            title="Director" 
            desc="Manage projects & approvals" 
            color="#E040FB" 
            icon="👔"
            onClick={() => navigate("/login/director")} 
          />

          <RoleCard 
            title="Worker" 
            desc="View tasks & schedule" 
            color="#FFAB40" 
            icon="👷"
            onClick={() => navigate("/login/worker")} 
          />
        </div>
      </motion.div>

      <div style={styles.footer}>
        <p>For more information, visit <a href="https://mechx.com.pk/" target="_blank" rel="noreferrer" style={{color: '#ff0000ff', textDecoration: 'none'}}>mechx.com.pk</a></p>
      </div>

    </div>
  );
};

// Reusable Role Card Component
const RoleCard = ({ title, desc, color, icon, onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.05, translateY: -5, backgroundColor: "rgba(255, 255, 255, 0.1)" }} 
    whileTap={{ scale: 0.95 }}
    onClick={onClick} 
    style={{...styles.card, borderTop: `4px solid ${color}`}}
  >
    <div style={{fontSize: '40px', marginBottom: '15px'}}>{icon}</div>
    <h2 style={{...styles.cardTitle, color: color}}>{title}</h2>
    <p style={styles.desc}>{desc}</p>
  </motion.div>
);

// --- PREMIUM DARK STYLES ---
const styles = {
  container: { 
    minHeight: "100vh", 
    position: "relative", 
    fontFamily: "'Inter', 'Segoe UI', sans-serif", 
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "#121212" // Ultimate fallback color
  },

  // ✅ 1. Static Image Layer (Z-Index 0)
  backgroundImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
    opacity: 1
  },

  // ✅ 2. Video Layer (Z-Index 1) - Sits on top of image
  videoBackground: {
    position: "absolute", 
    inset: 0, 
    width: "100%", 
    height: "100%", 
    objectFit: "cover", 
    zIndex: 1 
  },

  // ✅ 3. Overlay Layer (Z-Index 2) - Darkens both
  overlay: {
    position: "absolute", 
    inset: 0, 
    width: "100%", 
    height: "100%", 
    background: "rgba(0, 0, 0, 0.85)", 
    zIndex: 2 
  },

  // ✅ 4. Content Layer (Z-Index 3+) - Clickable
  navbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 50px",
    background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)", 
    position: "relative", zIndex: 10
  },
  logoText: { margin: 0, fontSize: "28px", fontWeight: "bold", color: "white", letterSpacing: "2px" },
  
  websiteBtn: {
    padding: "10px 20px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "30px",
    color: "white", textDecoration: "none", fontSize: "14px", transition: "all 0.3s", background: "rgba(0,0,0,0.3)"
  },

  content: { 
    flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", 
    position: "relative", zIndex: 3, padding: "40px 20px"
  },

  title: { color: "white", fontSize: "48px", marginBottom: "20px", fontWeight: "800", letterSpacing: "1px" },
  
  aboutText: {
    color: "#ccc", fontSize: "16px", maxWidth: "700px", lineHeight: "1.6", marginBottom: "40px"
  },

  subtitle: { color: "#aaa", fontSize: "18px", marginBottom: "30px", textTransform: "uppercase", letterSpacing: "1px" },

  grid: { display: "flex", gap: "30px", justifyContent: "center", flexWrap: "wrap" },

  card: { 
    background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(15px)", padding: "30px", borderRadius: "20px", width: "260px", cursor: "pointer", 
    border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", transition: "background 0.3s"
  },
  cardTitle: { margin: "0 0 10px 0", fontSize: "24px" },
  desc: { color: "#ddd", fontSize: "14px" },

  footer: {
    padding: "20px", textAlign: "center", color: "#888", fontSize: "14px", 
    background: "rgba(0,0,0,0.2)", position: "relative", zIndex: 3
  }
};

export default Landing;