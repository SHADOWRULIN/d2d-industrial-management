import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const DirectorFeedbackView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/director/feedback/${id}`)
      .then(res => {
        setFeedbackList(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching feedback:", err);
        setLoading(false);
      });
  }, [id]);

  const isMobile = windowWidth < 768;

  const dynamicHeader = {
    ...styles.header,
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "flex-start" : "center",
    gap: isMobile ? "15px" : "20px"
  };

  return (
    <div style={{ ...styles.container, padding: isMobile ? "20px 15px" : "40px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.wrapper}>
        
        <div style={dynamicHeader}>
          <button onClick={() => navigate(`/director/project/${id}`)} style={styles.backBtn}>← Back</button>
          <h2 style={{ ...styles.title, fontSize: isMobile ? "18px" : "24px" }}>
            Client Feedback | <span style={{color: '#FF4081'}}>Proposal #{id}</span>
          </h2>
        </div>

        {loading ? (
          <p style={{color: '#aaa', textAlign: 'center'}}>Loading feedback...</p>
        ) : feedbackList.length > 0 ? (
          <div style={styles.feedbackGrid}>
            {feedbackList.map((f, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.01 }}
                style={{
                  ...styles.feedbackCard,
                  padding: isMobile ? "20px" : "25px"
                }}
              >
                <div style={{ ...styles.ratingRow, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "8px" : "0px" }}>
                  <span style={styles.ratingBadge}>Rating: {f.client_rating}/5 ⭐</span>
                  <span style={styles.dateText}>{f.timestamp || "Recent"}</span>
                </div>
                <p style={{ ...styles.commentText, fontSize: isMobile ? "14px" : "16px" }}>"{f.comments}"</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>No feedback has been submitted for this project yet.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#121212", fontFamily: "'Segoe UI', sans-serif", overflowX: "hidden" },
  wrapper: { maxWidth: "900px", margin: "0 auto" },
  header: { display: "flex", marginBottom: "30px", borderBottom: '1px solid #333', paddingBottom: '15px' },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid #444", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", fontSize: "14px" },
  title: { color: "white", margin: 0, fontWeight: "600" },
  
  feedbackGrid: { display: "flex", flexDirection: "column", gap: "20px" },
  feedbackCard: { 
    background: "rgba(255, 255, 255, 0.05)", 
    borderRadius: "15px", 
    border: "1px solid #333",
    borderLeft: "5px solid #FF4081",
    boxSizing: "border-box"
  },
  ratingRow: { display: "flex", justifyContent: "space-between" },
  ratingBadge: { background: "#FF4081", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", width: "fit-content" },
  dateText: { color: "#666", fontSize: "12px" },
  commentText: { color: "#ddd", fontStyle: "italic", lineHeight: "1.6", margin: "10px 0 0 0" },
  emptyState: { textAlign: "center", padding: "50px", background: "rgba(255,255,255,0.02)", borderRadius: "15px", border: "1px dashed #444", color: "#666" }
};

export default DirectorFeedbackView;