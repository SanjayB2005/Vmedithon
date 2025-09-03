import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Users, Activity, Package, BarChart3, 
  MessageSquare, Bell, Settings, Heart, Thermometer,
  TrendingUp, Calendar, User, MapPin, Clock, Shield
} from 'lucide-react';

const SecureHealthChain = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'patients', icon: Users, label: 'Patients' },
    { id: 'staff', icon: User, label: 'Staff' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const patientStats = [
    { label: 'Temperature', value: '36.2°C', icon: Thermometer, color: 'bg-blue-500', trend: 'normal' },
    { label: 'Heart Rate', value: '98 bpm', icon: Heart, color: 'bg-red-500', trend: 'normal' },
    { label: 'Blood Type', value: 'A+', icon: Activity, color: 'bg-purple-500', trend: 'stable' },
    { label: 'Weight', value: '72 kg', icon: TrendingUp, color: 'bg-green-500', trend: 'up' }
  ];

  const recentActivities = [
    { type: 'Blood Test', time: '08:30 - 09:00', doctor: 'Dr. Sarah Wilson', status: 'completed' },
    { type: 'Cardiologist', time: '10:00 - 10:30', doctor: 'Dr. Michael Chen', status: 'scheduled' },
    { type: 'X-Ray', time: '14:00 - 14:15', doctor: 'Dr. Emily Johnson', status: 'pending' }
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-blue-600 to-blue-800 shadow-2xl z-50"
      >
        <div className="flex flex-col items-center py-6 h-full">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-8 shadow-lg"
          >
            <Shield className="text-blue-600 text-2xl" />
          </motion.div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <item.icon className="text-xl" />
              </motion.button>
            ))}
          </div>

          {/* User Profile */}
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center cursor-pointer shadow-lg"
          >
            <span className="text-white font-bold text-sm">IH</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="ml-20 min-h-screen">
        {/* Header */}
        <motion.header 
          {...fadeIn}
          className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-8 py-6 sticky top-0 z-40"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SecureHealthChain
              </h1>
              <p className="text-gray-600 mt-1">Exceptional care close to you!</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">{currentTime.toLocaleDateString()}</p>
                <p className="font-medium text-gray-700">{currentTime.toLocaleTimeString()}</p>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="font-bold">IH</span>
                </div>
                <div>
                  <p className="font-medium">Ika Hanudin</p>
                  <p className="text-xs opacity-80">24 years, Indonesia</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <motion.div 
          variants={stagger}
          initial="initial"
          animate="animate"
          className="p-8 space-y-8"
        >
          {/* Discount Banner */}
          <motion.div 
            variants={fadeIn}
            className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Today! Discounts on all corona tests</h2>
                <p className="opacity-90">and applies to all branches in Indonesia</p>
              </div>
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center"
              >
                <Activity className="text-6xl" />
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {patientStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeIn}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="text-white text-xl" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    stat.trend === 'normal' ? 'bg-green-100 text-green-700' :
                    stat.trend === 'up' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Patient Progress Chart */}
            <motion.div 
              variants={fadeIn}
              className="lg:col-span-2 bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200/50"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Progress Statistics</h3>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">102 bpm/minute</span>
                </div>
              </div>
              
              <div className="h-64 flex items-center justify-center">
                <motion.div 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="w-full h-full relative"
                >
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    <motion.path
                      d="M 50,100 Q 100,50 150,100 T 250,100 Q 300,50 350,100"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Calendar & Appointments */}
            <motion.div variants={fadeIn} className="space-y-6">
              {/* Calendar */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200/50">
                <h3 className="text-lg font-bold text-gray-800 mb-4">October</h3>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="font-medium text-gray-500 py-2">{day}</div>
                  ))}
                  {Array.from({length: 31}, (_, i) => i + 1).map(date => (
                    <motion.div
                      key={date}
                      whileHover={{ scale: 1.1 }}
                      className={`py-2 rounded-lg cursor-pointer transition-colors ${
                        date === 8 ? 'bg-orange-500 text-white font-bold' :
                        date === 5 ? 'bg-blue-100 text-blue-700' :
                        'hover:bg-gray-100'
                      }`}
                    >
                      {date}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Health Metrics */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <Activity className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Vitamin D</p>
                        <p className="text-sm text-gray-500">2 times everyday</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">50%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Activity className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Immune Renew</p>
                        <p className="text-sm text-gray-500">3 times everyday</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">92%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activities & Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              variants={fadeIn}
              className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200/50"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-white/80 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-500' :
                        activity.status === 'scheduled' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-gray-500">{activity.doctor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.time}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                        activity.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              variants={fadeIn}
              className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200/50"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Your Treatment</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-blue-50/50">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Activity className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Gentle Iron</p>
                    <p className="text-sm text-gray-500">2 capsules with meal everyday</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-orange-50/50">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Activity className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Vitamin</p>
                    <p className="text-sm text-gray-500">1 tablet after a meal everyday</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SecureHealthChain;