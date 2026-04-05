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

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.wrapper}>
        
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate(`/director/project/${id}`)} style={styles.backBtn}>← Back to Manager</button>
          <h2 style={styles.title}>Client Feedback | <span style={{color: '#FF4081'}}>Proposal #{id}</span></h2>
        </div>

        {loading ? (
          <p style={{color: '#aaa', textAlign: 'center'}}>Loading feedback...</p>
        ) : feedbackList.length > 0 ? (
          <div style={styles.feedbackGrid}>
            {feedbackList.map((f, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.02 }}
                style={styles.feedbackCard}
              >
                <div style={styles.ratingRow}>
                  <span style={styles.ratingBadge}>Rating: {f.client_rating}/5 ⭐</span>
                  <span style={styles.dateText}>{f.timestamp || "Recent"}</span>
                </div>
                <p style={styles.commentText}>"{f.comments}"</p>
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
  container: { minHeight: "100vh", background: "#121212", padding: "40px", fontFamily: "'Segoe UI', sans-serif" },
  wrapper: { maxWidth: "900px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", borderBottom: '1px solid #333', paddingBottom: '15px' },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid #444", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer" },
  title: { color: "white", margin: 0 },
  
  feedbackGrid: { display: "flex", flexDirection: "column", gap: "20px" },
  feedbackCard: { 
    background: "rgba(255, 255, 255, 0.05)", 
    padding: "25px", 
    borderRadius: "15px", 
    border: "1px solid #333",
    borderLeft: "5px solid #FF4081" 
  },
  ratingRow: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  ratingBadge: { background: "#FF4081", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" },
  dateText: { color: "#666", fontSize: "12px" },
  commentText: { color: "#ddd", fontSize: "16px", fontStyle: "italic", lineHeight: "1.6" },
  emptyState: { textAlign: "center", padding: "50px", background: "rgba(255,255,255,0.02)", borderRadius: "15px", border: "1px dashed #444", color: "#666" }
};

export default DirectorFeedbackView;