import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaIdBadge, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-primary to-indigo-600"></div>

          {/* Profile Info */}
          <div className="relative px-6 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="inline-block p-1 bg-white rounded-full">
                <FaUserCircle className="text-9xl text-gray-300 bg-white rounded-full" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">{user.role}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-semibold text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                    <FaIdBadge className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-semibold text-gray-900 font-mono text-sm">{user._id || user.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <FaShieldAlt className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    <div className="flex items-center mt-1">
                      <span className="h-2.5 w-2.5 bg-green-500 rounded-full mr-2"></span>
                      <span className="font-semibold text-gray-900">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
