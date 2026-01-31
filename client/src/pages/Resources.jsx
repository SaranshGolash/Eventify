import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLaptop, FaChalkboardTeacher, FaVideo, FaClock, FaPlus, FaDollarSign } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';

// Initialize Stripe (using publishable key from environment)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Booking Modal State
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingData, setBookingData] = useState({
    start_time: '',
    end_time: '',
    purpose: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchResources();
    if (searchParams.get('success')) {
      alert('Booking Payment Successful! Your booking is confirmed.');
    }
    if (searchParams.get('canceled')) {
      alert('Booking cancelled.');
    }
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get('/api/resources');
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (resource) => {
    setSelectedResource(resource);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post('/api/resources/create-checkout-session', {
        resource: selectedResource,
        bookingDetails: bookingData
      }, config);

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        alert('Failed to get payment URL from server.');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to initiate booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getIcon = (type) => {
    if (type?.toLowerCase().includes('lab') || type?.toLowerCase().includes('computer')) return <FaLaptop />;
    if (type?.toLowerCase().includes('venue') || type?.toLowerCase().includes('hall')) return <FaChalkboardTeacher />;
    return <FaVideo />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Campus Resources</h1>
            <p className="text-gray-500">Book venues and equipment for your events</p>
          </div>
          {user && (
            <Link to="/resources/add" className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-indigo-600 transition-colors">
              <FaPlus /> Add Resource
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {resource.image_url && (
                    <div className="h-48 w-full overflow-hidden">
                        <img src={resource.image_url} alt={resource.name} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-indigo-50 text-indigo-600`}>
                            {getIcon(resource.type)}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${resource.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {resource.status || 'Available'}
                        </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{resource.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{resource.type} • Capacity: {resource.capacity}</p>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{resource.description}</p>
                    
                    <div className="mt-auto">
                        <div className="flex items-center gap-1 text-gray-900 font-bold text-lg mb-4">
                            <FaDollarSign className="text-green-600" />
                            {resource.price_per_hour ? `${resource.price_per_hour}/hr` : 'Free'}
                        </div>

                        <button 
                            onClick={() => handleBookClick(resource)}
                            className="w-full py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-indigo-600 transition-colors shadow-lg shadow-primary/20"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {selectedResource && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-2">Book {selectedResource.name}</h2>
              <p className="text-gray-500 mb-6">Enter booking details to proceed to payment.</p>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className="w-full p-3 border rounded-xl bg-gray-50"
                    value={bookingData.start_time}
                    onChange={e => setBookingData({...bookingData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className="w-full p-3 border rounded-xl bg-gray-50"
                    value={bookingData.end_time}
                    onChange={e => setBookingData({...bookingData, end_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <textarea 
                    required 
                    rows="3"
                    className="w-full p-3 border rounded-xl bg-gray-50 resize-none"
                    placeholder="e.g. Workshop for Tech Club"
                    value={bookingData.purpose}
                    onChange={e => setBookingData({...bookingData, purpose: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setSelectedResource(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={processing}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex justify-center items-center"
                  >
                    {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Proceed to Pay'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
