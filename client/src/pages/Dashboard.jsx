import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUserCircle, FaCalendarCheck, FaLayerGroup } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 flex items-center gap-6"
        >
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-primary text-4xl">
            <FaUserCircle />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.name || 'User'}!</h1>
            <p className="text-gray-500 mt-1">{user?.role === 'organizer' ? 'Organizer Dashboard' : 'Student Dashboard'} • {user?.email}</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FaCalendarCheck /></div>
              <h3 className="font-semibold text-gray-700">Upcoming Events</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 pl-14">3</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><FaLayerGroup /></div>
              <h3 className="font-semibold text-gray-700">My Clubs</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 pl-14">2</p>
          </div>
        </div>

        {/* Recent Activity/Content Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64">
             <h3 className="font-bold text-gray-800 mb-4">My Bookings</h3>
             <div className="flex items-center justify-center h-4/5 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
               No recent bookings found.
             </div>
           </div>
           
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64">
             <h3 className="font-bold text-gray-800 mb-4">Notifications</h3>
             <div className="flex items-center justify-center h-4/5 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
               You're all caught up!
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
