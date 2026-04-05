import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const VendorMgmt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vendorsList, setVendorsList] = useState([]);
  const [vendorDetails, setVendorDetails] = useState({ name: "", phone: "", type: "Raw Material" });
  
  const [currentItem, setCurrentItem] = useState({ material: "", quantity: "", price: "", date: "" });
  const [orderQueue, setOrderQueue] = useState([]); 
  const [history, setHistory] = useState([]); 
  const [viewHistory, setViewHistory] = useState(false);

  // 🟢 NEW: Error/Success Message State
  const [message, setMessage] = useState(null); 

  const loadData = useCallback(() => {
    // Fetch Vendors
    axios.get(`${API_BASE_URL}/api/director/vendors/${id}`)
         .then(res => setVendorsList(res.data))
         .catch(err => console.error("Error loading vendor list"));

    // Fetch History
    axios.get(`${API_BASE_URL}/api/director/vendor_orders/${id}`)
         .then(res => setHistory(res.data))
         .catch(err => console.error("Error loading history"));
  }, [id]);

  useEffect(() => {
    if (!localStorage.getItem("director_auth")) navigate("/director");
    loadData();
  }, [loadData, navigate]);

  // --- HANDLERS ---

  const addItemToQueue = (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    if (!currentItem.material || !currentItem.quantity || !currentItem.price || !currentItem.date) {
      setMessage({ type: 'error', text: "⚠️ Please fill in all fields for the item." });
      return;
    }
    
    // Add to queue
    setOrderQueue([...orderQueue, currentItem]);
    
    // Reset item form but keep date for convenience
    setCurrentItem({ material: "", quantity: "", price: "", date: currentItem.date }); 
  };

  const removeItem = (index) => {
    const updated = [...orderQueue];
    updated.splice(index, 1);
    setOrderQueue(updated);
  };

  const saveOrder = async () => {
    setMessage(null);

    // 1. Validation Checks
    if (!vendorDetails.name) {
        setMessage({ type: 'error', text: "⚠️ Please enter a Vendor Name." });
        return;
    }
    if (orderQueue.length === 0) {
        setMessage({ type: 'error', text: "⚠️ You must add at least one material item." });
        return;
    }

    // 2. Prepare Payload
    const payload = {
        proposal_id: id,
        vendor_name: vendorDetails.name,
        vendor_phone: vendorDetails.phone,
        vendor_type: vendorDetails.type,
        items: orderQueue
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/director/vendor_orders/add`, payload);
      
      if (res.data.success) {
        setMessage({ type: 'success', text: "✅ Order Saved Successfully!" });
        setOrderQueue([]); 
        setVendorDetails({ name: "", phone: "", type: "Raw Material" }); 
        loadData(); 
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: "❌ Failed: " + res.data.message });
      }
    } catch (err) {
      // 🟢 Specific Error Handling
      if (err.response && err.response.data) {
          setMessage({ type: 'error', text: "❌ Server Error: " + err.response.data.message });
      } else {
          setMessage({ type: 'error', text: "⚠️ Network Error: Is the backend server running?" });
      }
    }
  };

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.wrapper}>
        
        <div style={styles.header}>
          <button onClick={() => navigate(`/director/project/${id}`)} style={styles.backBtn}>← Back to Menu</button>
          <h2 style={styles.title}>Vendor & Procurement</h2>
        </div>

        {/* 🟢 ERROR / SUCCESS BANNER */}
        {message && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                style={{
                    ...styles.messageBanner, 
                    backgroundColor: message.type === 'error' ? 'rgba(255, 82, 82, 0.1)' : 'rgba(0, 230, 118, 0.1)',
                    borderColor: message.type === 'error' ? '#FF5252' : '#00E676',
                    color: message.type === 'error' ? '#FF5252' : '#00E676'
                }}
            >
                {message.text}
            </motion.div>
        )}

        {!viewHistory ? (
          <>
            <div style={styles.splitLayout}>
              
              {/* LEFT: Vendor Details */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>1. Vendor Details</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Vendor Name</label>
                  <input 
                    list="vendor-options"
                    placeholder="Select or Type New..." 
                    style={styles.input} 
                    value={vendorDetails.name}
                    onChange={e => setVendorDetails({...vendorDetails, name: e.target.value})}
                  />
                  <datalist id="vendor-options">
                    {vendorsList.map((v, i) => <option key={i} value={v} />)}
                  </datalist>

                  <label style={styles.label}>Phone Number</label>
                  <input 
                    placeholder="0300-1234567" 
                    style={styles.input}
                    value={vendorDetails.phone}
                    onChange={e => setVendorDetails({...vendorDetails, phone: e.target.value})}
                  />

                  <label style={styles.label}>Vendor Type</label>
                  <select 
                    style={styles.input}
                    value={vendorDetails.type}
                    onChange={e => setVendorDetails({...vendorDetails, type: e.target.value})}
                  >
                    <option style={styles.option}>Raw Material</option>
                    <option style={styles.option}>Parts/Items</option>
                    <option style={styles.option}>Services</option>
                  </select>
                </div>
              </div>

              {/* RIGHT: Material Entry */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>2. Add Items</h3>
                <form onSubmit={addItemToQueue} style={styles.formGroup}>
                  <label style={styles.label}>Material / Item Name</label>
                  <input 
                    placeholder="e.g. Steel Sheets" 
                    style={styles.input}
                    value={currentItem.material}
                    onChange={e => setCurrentItem({...currentItem, material: e.target.value})}
                  />

                  {/* Quantity on its own line */}
                  <label style={styles.label}>Quantity</label>
                  <input 
                    type="number" 
                    placeholder="Enter Quantity"
                    style={styles.input} 
                    value={currentItem.quantity} 
                    onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} 
                  />

                  {/* Price on its own line */}
                  <label style={styles.label}>Price per Unit ($)</label>
                  <input 
                    type="number" 
                    placeholder="Enter Price"
                    style={styles.input} 
                    value={currentItem.price} 
                    onChange={e => setCurrentItem({...currentItem, price: e.target.value})} 
                  />

                  <label style={styles.label}>Purchase Date</label>
                  <input 
                    type="date" 
                    style={styles.input} 
                    value={currentItem.date} 
                    onChange={e => setCurrentItem({...currentItem, date: e.target.value})} 
                  />

                  <button type="submit" style={styles.addBtn}>+ Add to List</button>
                </form>
              </div>
            </div>

            {/* BOTTOM: Order Queue Table */}
            <div style={{...styles.card, marginTop: '30px'}}>
              <h3 style={{color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0}}>Current Order List (Unsaved)</h3>
              
              {orderQueue.length === 0 ? (
                <p style={{color: '#888', textAlign: 'center', padding: '20px'}}>No items added to this order yet.</p>
              ) : (
                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                    <thead><tr style={styles.headerRow}><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Action</th></tr></thead>
                    <tbody>
                        {orderQueue.map((item, i) => (
                        <tr key={i} style={styles.row}>
                            <td style={styles.td}>{item.material}</td>
                            <td style={styles.td}>{item.quantity}</td>
                            <td style={styles.td}>${item.price}</td>
                            <td style={styles.td}>${item.quantity * item.price}</td>
                            <td style={styles.td}>
                            <button onClick={() => removeItem(i)} style={styles.delBtn}>Remove</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              )}
              
              <div style={styles.actionBar}>
                <button onClick={() => setViewHistory(true)} style={styles.viewBtn}>📜 View History</button>
                <button onClick={saveOrder} style={styles.saveBtn}>💾 Save Entire Order</button>
              </div>
            </div>
          </>
        ) : (
          /* --- HISTORY VIEW --- */
          <div style={styles.card}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                <h3 style={{color: '#FFAB40', margin: 0}}>Procurement History</h3>
                <button onClick={() => setViewHistory(false)} style={styles.backBtnDark}>← Back to Entry</button>
            </div>
            <table style={styles.table}>
              <thead><tr style={styles.headerRow}><th>Date</th><th>Vendor</th><th>Type</th><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={styles.row}>
                    <td style={styles.td}>{h.purchase_date}</td>
                    <td style={styles.td}><strong style={{color: '#FFAB40'}}>{h.vendor_name}</strong></td>
                    <td style={styles.td}>{h.vendor_type}</td>
                    <td style={styles.td}>{h.material}</td>
                    <td style={styles.td}>{h.quantity}</td>
                    <td style={styles.td}>${h.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </motion.div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Segoe UI', sans-serif", padding: "40px" },
  wrapper: { maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", borderBottom: '1px solid #333', paddingBottom: '20px' },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid #444", color: "white", padding: "10px 20px", borderRadius: "30px", cursor: "pointer" },
  title: { color: "white", margin: 0 },
  splitLayout: { display: "flex", gap: "30px", flexWrap: "wrap" },
  card: { background: "#1a1a1a", padding: "35px", borderRadius: "15px", flex: 1, minWidth: "350px", border: "1px solid #333", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" },
  cardTitle: { marginTop: 0, marginBottom: "25px", color: "#FFAB40", borderBottom: "1px solid #333", paddingBottom: "15px", fontSize: '18px', textTransform: 'uppercase' },
  formGroup: { display: "flex", flexDirection: "column", gap: "18px" },
  label: { fontWeight: "bold", fontSize: "12px", color: "#888", marginBottom: "-10px", textTransform: 'uppercase' },
  input: { 
    padding: "14px", 
    borderRadius: "8px", 
    border: "1px solid #444", 
    background: "#222", 
    color: "white", 
    outline: "none", 
    width: "100%",
    boxSizing: "border-box",
    fontSize: "15px"
  },
  option: { background: "#222", color: "white" },
  addBtn: { padding: "14px", background: "#2E7D32", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "10px", fontSize: '15px' },
  delBtn: { padding: "5px 12px", background: "rgba(255, 82, 82, 0.1)", color: "#FF5252", border: "1px solid #FF5252", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
  actionBar: { marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "15px", borderTop: "1px solid #333", paddingTop: "25px" },
  saveBtn: { padding: "14px 30px", background: "linear-gradient(90deg, #FFAB40, #FF6D00)", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  viewBtn: { padding: "14px 30px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid #444", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  backBtnDark: { padding: "8px 15px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid #444", borderRadius: "8px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px", color: "#ddd" },
  headerRow: { background: "rgba(255,255,255,0.02)", textAlign: "left" },
  row: { borderBottom: "1px solid #222" },
  td: { padding: "15px" },
  // 🟢 ADDED: Message Banner Style for new functionality
  messageBanner: { padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid', fontWeight: 'bold', textAlign: 'center' }
};

export default VendorMgmt;