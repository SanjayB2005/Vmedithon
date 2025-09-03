import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { FaUser, FaWallet } from "react-icons/fa";

function FrontPageManagement() {
  const [userId, setUserId] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!userId.trim()) {
      alert('Please enter a User ID');
      return;
    }
    if (!walletAddress) {
      alert('Please connect your wallet first.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, walletAddress })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  const handleConnectWallet = async () => {
    setWalletError("");
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (err) {
        setWalletError("Wallet connection failed.");
      }
    } else {
      setWalletError("MetaMask not detected. Please install MetaMask.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-xl space-y-8">
      <h2 className="text-3xl font-bold text-center text-purple-700 mb-4">Login</h2>
      {/* User ID Input */}
      <div>
        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Enter your User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200 text-gray-700"
          />
        </div>
      </div>

      {/* Connect Wallet Button */}
      <div>
        <motion.button
          onClick={handleConnectWallet}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full ${walletAddress ? "bg-green-400" : "bg-green-600"} text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors duration-200 shadow-lg flex items-center justify-center space-x-2`}
          disabled={!!walletAddress}
        >
          <FaWallet className="w-5 h-5" />
          <span>
            {walletAddress ? "Wallet Connected" : "Connect Your Wallet"}
          </span>
        </motion.button>
        {walletAddress && (
          <div className="mt-2 text-xs text-green-700 break-all text-center">
            Connected: {walletAddress}
          </div>
        )}
        {walletError && (
          <div className="mt-2 text-xs text-red-600 text-center">
            {walletError}
          </div>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
        />
        <span className="text-gray-700">Remember me</span>
      </div>

      {/* Sign In Button */}
      <motion.button
        onClick={handleSignIn}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors duration-200 shadow-lg"
      >
        Sign In
      </motion.button>
    </div>
  );
}

export default FrontPageManagement;
