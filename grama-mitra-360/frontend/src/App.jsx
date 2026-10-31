import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import VoiceAssistant from './pages/VoiceAssistant.jsx';
import Eligibility from './pages/Eligibility.jsx';
import Documents from './pages/Documents.jsx';
import OfflineHelp from './pages/OfflineHelp.jsx';
import TrustDashboard from './pages/TrustDashboard.jsx';
import SafetyCenter from './pages/SafetyCenter.jsx';
import SupportDashboard from './pages/SupportDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/voice" element={<VoiceAssistant />} />
        <Route path="/eligibility/:slug?" element={<Eligibility />} />
        <Route path="/documents/:slug?" element={<Documents />} />
        <Route path="/offline" element={<OfflineHelp />} />
        <Route path="/trust" element={<TrustDashboard />} />
        <Route path="/safety" element={<SafetyCenter />} />
        <Route path="/staff" element={<SupportDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
