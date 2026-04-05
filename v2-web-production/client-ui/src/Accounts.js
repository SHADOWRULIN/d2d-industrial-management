import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./apiConfig";

const Accounts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState({ total_cost: 0, total_paid: 0, balance: 0, bill_count: 0 });

  useEffect(() => {
    if (!localStorage.getItem("director_auth")) navigate("/director");
    axios.get(`${API_BASE_URL}/api/director/financial_summary/${id}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error(err));
  }, [id, navigate, activeTab]);

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.wrapper}>
        
        <div style={styles.header}>
          <button onClick={() => navigate(`/director/project/${id}`)} style={styles.backBtn}>← Back to Menu</button>
          <h2 style={styles.title}>Financial Overview | <span style={{color: '#448AFF'}}>Project #{id}</span></h2>
        </div>

        <div style={styles.tabContainer}>
            <TabButton label="Financial Summary" active={activeTab === "summary"} onClick={() => setActiveTab("summary")} />
            <TabButton label="Payment Processing" active={activeTab === "payments"} onClick={() => setActiveTab("payments")} />
            <TabButton label="Bills & Invoices" active={activeTab === "bills"} onClick={() => setActiveTab("bills")} />
        </div>

        <div style={styles.contentBox}>
            {activeTab === "summary" && <SummaryView summary={summary} />}
            {activeTab === "payments" && <PaymentsView proposalId={id} />}
            {activeTab === "bills" && <BillsView proposalId={id} />}
        </div>
      </motion.div>
    </div>
  );
};

// --- SUMMARY VIEW ---
const SummaryView = ({ summary }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.grid}>
        <SummaryCard title="Total Project Cost" value={`$${summary.total_cost.toLocaleString()}`} color="#448AFF" />
        <SummaryCard title="Amount Paid" value={`$${summary.total_paid.toLocaleString()}`} color="#00E676" />
        <SummaryCard title="Outstanding Balance" value={`$${summary.balance.toLocaleString()}`} color="#FF5252" />
        <SummaryCard title="Total Bills" value={summary.bill_count} color="#E040FB" />
    </motion.div>
);

// --- PAYMENT PROCESSING VIEW ---
const PaymentsView = ({ proposalId }) => {
    const [payments, setPayments] = useState([]);
    const [vendorName, setVendorName] = useState("");
    const [vendorsList, setVendorsList] = useState([]); 
    const [dueInfo, setDueInfo] = useState(null);
    const [form, setForm] = useState({ amount: "", status: "Paid", payment_date: "" });

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/director/payments/${proposalId}`).then(res => setPayments(res.data));
        axios.get(`${API_BASE_URL}/api/director/vendors/${proposalId}`).then(res => setVendorsList(res.data));
    }, [proposalId]);

    const checkDue = async () => {
        if(!vendorName) return alert("Select a Vendor");
        try {
            const res = await axios.post(`${API_BASE_URL}/api/director/vendor_due`, { proposal_id: proposalId, vendor_name: vendorName });
            if(res.data.success) {
                setDueInfo(res.data);
                setForm({...form, amount: res.data.remaining});
            } else { alert(res.data.message); }
        } catch (err) { alert("Error checking vendor."); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post(`${API_BASE_URL}/api/director/payments/add`, { 
            proposal_id: proposalId, serial_number: payments.length + 1, vendor_name: vendorName,
            vendor_phone: dueInfo?.phone || "", vendor_type: dueInfo?.type || "", amount: form.amount, status: form.status, payment_date: form.payment_date
        });
        alert("✅ Transaction Recorded!");
        axios.get(`${API_BASE_URL}/api/director/payments/${proposalId}`).then(res => setPayments(res.data));
    };

    return (
        <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
            <div style={styles.formCard}>
                <h3 style={{color:'#448AFF', marginBottom:'25px'}}>Process Payment</h3>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>1. Select Vendor</label>
                    <input list="vendor-list" placeholder="Type or Select Vendor..." style={styles.input} value={vendorName} onChange={e => setVendorName(e.target.value)} />
                    <datalist id="vendor-list">{vendorsList.map((v, i) => <option key={i} value={v} />)}</datalist>
                </div>

                <button onClick={checkDue} style={{...styles.blueBtn, width:'100%', marginBottom:'25px'}}>Check Due Amount</button>

                {dueInfo && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.infoBox}>
                            <p style={{margin:0, color:'#bbb'}}>Total Bill: ${dueInfo.total_bill}</p>
                            <p style={{margin:'5px 0 0 0', color:'#FF5252', fontWeight:'bold'}}>Pending / Due: ${dueInfo.remaining}</p>
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>2. Payment Amount</label>
                            <input type="number" placeholder="Enter Amount" style={styles.input} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>3. Payment Date</label>
                            <input type="date" style={styles.input} onChange={e => setForm({...form, payment_date: e.target.value})} required />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>4. Status</label>
                            <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="Paid" style={styles.option}>Paid</option>
                                <option value="Not Paid" style={styles.option}>Not Paid</option>
                            </select>
                        </div>

                        <button style={styles.greenBtn}>Record Transaction</button>
                    </form>
                )}
            </div>

            <div style={{flex: 2, minWidth:'400px'}}>
                <h3 style={{color:'#fff', marginBottom:'20px'}}>Payment Ledger</h3>
                <table style={styles.table}>
                    <thead><tr style={styles.headerRow}><th>Date</th><th>Vendor</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                        {payments.map((p, i) => (
                            <tr key={i} style={styles.row}>
                                <td style={styles.td}>{p.payment_date}</td><td style={styles.td}>{p.vendor_name}</td>
                                <td style={styles.td}>${p.amount}</td>
                                <td style={styles.td}><span style={{...styles.badge, background: p.status === "Paid" ? "#00E676" : "#FF5252", color: 'black'}}>{p.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- BILLS VIEW ---
const BillsView = ({ proposalId }) => {
    const [bills, setBills] = useState([]);
    const [vendorsList, setVendorsList] = useState([]); 
    const [form, setForm] = useState({ vendor_name: "", vendor_phone: "", vendor_type: "Raw Material", material: "", quantity: 1, price: 0, date: "" });

    const refreshData = useCallback(() => {
        axios.get(`${API_BASE_URL}/api/director/bills/${proposalId}`).then(res => setBills(res.data));
        axios.get(`${API_BASE_URL}/api/director/vendors/${proposalId}`).then(res => setVendorsList(res.data));
    }, [proposalId]);

    useEffect(() => { refreshData(); }, [refreshData]);

    const handleAddBill = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/director/bills/add`, { ...form, proposal_id: proposalId });
            if (response.data.success) {
                alert("✅ Bill Added Successfully!");
                refreshData(); 
                setForm(prev => ({ ...prev, material: "", quantity: 1, price: 0 })); 
            }
        } catch (error) { alert("Network Error"); }
    };

    return (
        <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
            <div style={styles.formCard}>
                <h3 style={{color:'#E040FB', marginBottom:'25px'}}>Add New Bill</h3>
                <form onSubmit={handleAddBill} style={styles.form}>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Vendor Name</label>
                        <input list="bill-v-list" placeholder="Select Vendor..." style={styles.input} value={form.vendor_name} onChange={e => setForm({...form, vendor_name: e.target.value})} required />
                        <datalist id="bill-v-list">{vendorsList.map((v, i) => <option key={i} value={v} />)}</datalist>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Phone Number</label>
                        <input placeholder="Vendor Phone" style={styles.input} value={form.vendor_phone} onChange={e => setForm({...form, vendor_phone: e.target.value})} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Vendor Category</label>
                        <select style={styles.input} value={form.vendor_type} onChange={e => setForm({...form, vendor_type: e.target.value})}>
                            <option value="Raw Material" style={styles.option}>Raw Material</option>
                            <option value="Parts/Items" style={styles.option}>Parts/Items</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Material Name</label>
                        <input placeholder="What was purchased?" style={styles.input} value={form.material} onChange={e => setForm({...form, material: e.target.value})} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Quantity</label>
                        <input type="number" placeholder="Enter Qty" style={styles.input} value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Price per Unit</label>
                        <input type="number" placeholder="Enter Unit Price" style={styles.input} value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Transaction Date</label>
                        <input type="date" style={styles.input} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                    </div>

                    <button style={{...styles.blueBtn, background:'#E040FB'}}>Confirm & Add Bill</button>
                </form>
            </div>

            <div style={{flex: 2, minWidth:'400px'}}>
                <h3 style={{color:'#fff', marginBottom:'20px'}}>Bill History Ledger</h3>
                <table style={styles.table}>
                    <thead><tr style={styles.headerRow}><th>Vendor</th><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
                    <tbody>
                        {bills.map((b, i) => (
                            <tr key={i} style={styles.row}>
                                <td style={styles.td}>{b.vendor_name}</td><td style={styles.td}>{b.material}</td>
                                <td style={styles.td}>{b.quantity}</td><td style={styles.td}>${(b.quantity * b.price).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- STYLES ---
const TabButton = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
        padding: "15px 30px", 
        background: active ? "rgba(68, 138, 255, 0.2)" : "transparent", 
        color: active ? "#448AFF" : "#888",
        border: "none", borderBottom: active ? "3px solid #448AFF" : "3px solid transparent",
        cursor: "pointer", fontWeight: "bold", fontSize: "14px", transition: "all 0.3s"
    }}>
        {label}
    </button>
);

const SummaryCard = ({ title, value, color }) => (
    <div style={{background: "rgba(255,255,255,0.05)", border: `1px solid ${color}`, color: 'white', padding: '20px', borderRadius: '15px', flex: 1, minWidth:'200px', textAlign: 'center'}}>
        <h4 style={{margin: '0 0 10px 0', color: color, fontSize:'14px'}}>{title}</h4>
        <span style={{fontSize: '24px', fontWeight: 'bold'}}>{value}</span>
    </div>
);

const styles = {
  container: { minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Segoe UI', sans-serif", padding: "40px" },
  wrapper: { maxWidth: "1250px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", borderBottom: '1px solid #333', paddingBottom: '20px' },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid #444", color: "white", padding: "10px 20px", borderRadius: "30px", cursor: "pointer" },
  title: { color: "white", margin: 0 },
  tabContainer: { display: "flex", borderBottom: "1px solid #333", marginBottom: "30px" },
  contentBox: { background: "rgba(255,255,255,0.02)", padding: "40px", borderRadius: "15px", border: "1px solid #333" },
  grid: { display: "flex", gap: "25px", flexWrap: 'wrap' },
  formCard: { flex: 1, minWidth: '350px', background: "rgba(0,0,0,0.5)", padding: "35px", borderRadius: "12px", border: "1px solid #333" },
  form: { display: "flex", flexDirection: "column" },
  formGroup: { marginBottom: "20px", display: "flex", flexDirection: "column" },
  infoBox: { background: 'rgba(255,82,82,0.1)', padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid rgba(255,82,82,0.3)' },
  label: { fontWeight: "bold", fontSize: "12px", color: "#999", marginBottom: "8px", textTransform: 'uppercase' },
  input: { 
    padding: "14px", 
    borderRadius: "8px", 
    border: "1px solid #444", 
    background: "#1a1a1a", 
    color: "white", 
    width: "100%", 
    fontSize: "15px",
    outline: 'none',
    boxSizing: 'border-box' 
  },
  option: {
    background: "#1a1a1a", // Fixes the white-out issue
    color: "white"
  },
  blueBtn: { padding: "14px", background: "#448AFF", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" },
  greenBtn: { padding: "14px", background: "#00E676", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", marginTop:'10px' },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px", color: "#eee" },
  headerRow: { background: "rgba(255,255,255,0.05)", textAlign: "left" },
  row: { borderBottom: "1px solid #222" },
  td: { padding: "15px" },
  badge: { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }
};

export default Accounts;