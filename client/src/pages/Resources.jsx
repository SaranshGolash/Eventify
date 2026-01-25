import React from 'react';
import { motion } from 'framer-motion';
import { FaLaptop, FaChalkboardTeacher, FaVideo, FaClock } from 'react-icons/fa';

const RESOURCES = [
  { id: 1, name: 'Seminar Hall A', type: 'Venue', capacity: '200', icon: <FaChalkboardTeacher />, status: 'Available' },
  { id: 2, name: 'Projector Kit 1', type: 'Equipment', capacity: 'N/A', icon: <FaVideo />, status: 'In Use' },
  { id: 3, name: 'Computer Lab 2', type: 'Lab', capacity: '50', icon: <FaLaptop />, status: 'Available' },
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Campus Resources</h1>
          <p className="text-gray-500">Book venues and equipment for your events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RESOURCES.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${resource.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {resource.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${resource.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {resource.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{resource.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{resource.type} • Capacity: {resource.capacity}</p>
              
              <button 
                disabled={resource.status !== 'Available'}
                className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
                  resource.status === 'Available' 
                    ? 'bg-primary text-white hover:bg-indigo-600' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {resource.status === 'Available' ? 'Book Now' : 'Unavailable'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
