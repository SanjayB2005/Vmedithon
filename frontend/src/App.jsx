import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SecureHealthChain from './component/managementComponent.jsx';
import FrontPageManagement from './component/FrontPageManagement.jsx';

function App() {
  return (
    <Routes>
      {/* Login / Signup Page */}
      <Route path="/" element={<FrontPageManagement />} />
      {/* Dashboard (protected later) */}
      <Route path="/dashboard" element={<SecureHealthChain />} />
    </Routes>
  );
}

export default App;
