import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const Inquiry = () => {
  const navigate = useNavigate();
  const clientId = localStorage.getItem("client_id");
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/client/proposals/${clientId}`);
        setProposals(response.data.sort((a, b) => b.proposal_id - a.proposal_id));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (clientId) fetchData();
  }, [clientId]);

  const isMobile = windowWidth < 768;

  const dynamicStyles = {
    ...styles.container,
    padding: isMobile ? "20px 15px" : "40px",
  };

  const dynamicGrid = {
    ...styles.grid,
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(400px, 1fr))",
  };

  const dynamicHeader = {
    ...styles.header,
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "flex-start" : "center",
    gap: isMobile ? "15px" : "0px",
  };

  return (
    <div style={dynamicStyles}>
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.wrapper}>
        <div style={dynamicHeader}>
          <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>← Back</button>
          <h2 style={{ ...styles.title, fontSize: isMobile ? "22px" : "32px" }}>My Project Inquiries</h2>
        </div>

        {loading ? (
          <p style={{ color: "white", textAlign: "center" }}>Loading status...</p>
        ) : proposals.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No active projects found.</p>
            <button onClick={() => navigate("/submit-proposal")} style={styles.createBtn}>Start a Project</button>
          </div>
        ) : (
          <div style={dynamicGrid}>
            {proposals.map((p, index) => (
              <StatusCard key={p.proposal_id} project={p} delay={index * 0.1} isMobile={isMobile} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const StatusCard = ({ project, delay, isMobile }) => {
  const status = project.status || "Pending";

  const getStatusColor = (s) => {
    if (s === "Approved" || s === "Completed") return "#00E676";
    if (s === "Rejected") return "#FF5252";
    return "#FFD740";
  };

  const borderColor = getStatusColor(status);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: delay }}
      style={{ 
        ...styles.card, 
        borderLeft: `5px solid ${borderColor}`,
        padding: isMobile ? "20px" : "25px"
      }}
    >
      <div style={{ ...styles.cardHeader, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "10px" : "0px" }}>
        <h3 style={{ ...styles.projectName, fontSize: isMobile ? "18px" : "20px" }}>{project.project_name}</h3>
        <span style={{ ...styles.badge, background: borderColor, color: "black" }}>
          {status}
        </span>
      </div>

      <p style={styles.desc}>{project.proposal_description}</p>

      {/* 🟢 NEW: Rejection Reason Display */}
      {status === "Rejected" && project.rejection_reason && (
        <div style={styles.rejectionBox}>
          <strong>Reason for Rejection:</strong><br />
          {project.rejection_reason}
        </div>
      )}

      {/* 🟢 NEW: Completion Message */}
      {status === "Completed" && (
        <div style={styles.completionBox}>
          <strong>Project Delivered & Closed</strong>
        </div>
      )}

      <div style={styles.meta}>
        <p style={{ marginBottom: "8px" }}><strong>Current Stage:</strong> {project.current_stage || "Initial Review"}</p>
        <p><strong>Timeline:</strong> {project.start_date || "TBD"} — {project.end_date || "TBD"}</p>
      </div>
    </motion.div>
  );
};

const styles = {
  container: { minHeight: "100vh", position: "relative", fontFamily: "'Segoe UI', sans-serif", overflowX: "hidden" },
  videoBackground: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -2 },
  overlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", zIndex: -1 },

  wrapper: { maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 },
  header: { display: "flex", marginBottom: "30px", borderBottom: "1px solid #333", paddingBottom: "20px" },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid #444", borderRadius: "10px", padding: "8px 15px", fontSize: "14px", cursor: "pointer", color: "white" },
  title: { color: "#ffffffff", margin: 0 },

  grid: { display: "grid", gap: "20px" },

  card: { background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)", color: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  cardHeader: { display: "flex", justifyContent: "space-between" },
  projectName: { margin: 0, color: "#fff", fontWeight: "bold" },
  badge: { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" },
  desc: { color: "#ccc", fontSize: "14px", marginBottom: "15px", lineHeight: "1.5" },
  meta: { background: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "10px", fontSize: "13px", color: "#ddd", border: "1px solid #333" },

  rejectionBox: { background: "rgba(255, 82, 82, 0.1)", border: "1px solid #FF5252", color: "#FF5252", padding: "15px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px", lineHeight: "1.4" },
  completionBox: { background: "rgba(0, 230, 118, 0.1)", border: "1px solid #00E676", color: "#00E676", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px", textAlign: "center" },

  emptyState: { textAlign: "center", marginTop: "50px", color: "#777" },
  createBtn: { background: "#4FC3F7", color: "black", border: "none", padding: "12px 25px", borderRadius: "8px", marginTop: "15px", cursor: "pointer", fontWeight: "bold" }
};

export default Inquiry;