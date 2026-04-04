import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- AUTH & COMMON ---
import Login from "./Login";
import DirectorLogin from "./DirectorLogin";

// --- CLIENT SIDE ---
import Dashboard from "./Dashboard";
import SubmitProposal from "./SubmitProposal";
import Inquiry from "./Inquiry";
import Feedback from "./Feedback";

// --- DIRECTOR SIDE ---
import DirectorDashboard from "./DirectorDashboard";
import ProjectManager from "./ProjectManager"; // The Hub Menu
import ProjectStatus from "./ProjectStatus";
import DirectorFeedbackView from "./DirectorFeedbackView";

// --- ACCOUNTS DEPT ---
import Accounts from "./Accounts";

// --- VENDOR DEPT ---
import VendorMgmt from "./VendorMgmt";

// --- MANUFACTURING DEPT ---
import Manufacturing from "./Manufacturing"; // Manufacturing Hub
import ManufacturingProcess from "./ManufacturingProcess";
import Warehouse from "./Warehouse";
import Workers from "./Workers";

// --- DELIVERY DEPT (These were likely missing!) ---
import Delivery from "./Delivery"; // Delivery Hub
import Packing from "./Packing";
import FinalDelivery from "./FinalDelivery";

// --- LANDING & WORKER LOGIN ---
import Landing from "./Landing";
import WorkerLogin from "./WorkerLogin";
import WorkerDashboard from "./WorkerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Entry */}
        <Route path="/" element={<Landing />} />
        {/* ========================== */}
        {/* 1. AUTH ROUTES             */}
        {/* ========================== */}
        <Route path="/login/client" element={<Login />} />
        <Route path="/login/director" element={<DirectorLogin />} />
        <Route path="/login/worker" element={<WorkerLogin />} />

        {/* ========================== */}
        {/* 2. CLIENT ROUTES           */}
        {/* ========================== */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit-proposal" element={<SubmitProposal />} />
        <Route path="/inquiry" element={<Inquiry />} />
        <Route path="/feedback" element={<Feedback />} />

        {/* ========================== */}
        {/* 3. DIRECTOR DASHBOARD      */}
        {/* ========================== */}
        <Route path="/director/project/:id/feedback" element={<DirectorFeedbackView />} />
        <Route path="/director/dashboard" element={<DirectorDashboard />} />
        
        {/* ========================== */}
        {/* 4. PROJECT MANAGEMENT HUB  */}
        {/* ========================== */}
        <Route path="/director/project/:id" element={<ProjectManager />} />
        <Route path="/director/project/:id/status" element={<ProjectStatus />} />

        {/* ========================== */}
        {/* 5. ACCOUNTS DEPARTMENT     */}
        {/* ========================== */}
        <Route path="/director/project/:id/accounts" element={<Accounts />} />

        {/* ========================== */}
        {/* 6. VENDOR MANAGEMENT       */}
        {/* ========================== */}
        <Route path="/director/project/:id/vendor" element={<VendorMgmt />} />

        {/* ========================== */}
        {/* 7. MANUFACTURING OPS       */}
        {/* ========================== */}
        <Route path="/director/project/:id/manufacturing" element={<Manufacturing />} />
        <Route path="/director/project/:id/manufacturing/process" element={<ManufacturingProcess />} />
        <Route path="/director/project/:id/manufacturing/warehouse" element={<Warehouse />} />
        <Route path="/director/project/:id/manufacturing/workers" element={<Workers />} />

        {/* ========================== */}
        {/* 8. DELIVERY & LOGISTICS    */}
        {/* ========================== */}
        {/* 👇 THIS IS WHAT YOU WERE MISSING 👇 */}
        <Route path="/director/project/:id/delivery" element={<Delivery />} />
        <Route path="/director/project/:id/delivery/packing" element={<Packing />} />
        <Route path="/director/project/:id/delivery/final" element={<FinalDelivery />} />

        {/* ========================== */}
        {/* 9. Worker Dashboard        */}
        {/* ========================== */}
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;