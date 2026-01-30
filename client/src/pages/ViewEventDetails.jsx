import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaEdit, FaCheck } from 'react-icons/fa';
import axios from 'axios';

const ViewEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [registered, setRegistered] = useState(false); // To track if user is registered

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${id}`);
        setEvent(response.data);
        setFormData(response.data);
        // Here you would also check if the current user is already registered for this event
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/events/${id}/register`, {}, config);
      setRegistered(true);
      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/events/${id}/register`, config);
      setRegistered(false);
      alert('Successfully unregistered from the event!');
    } catch (error) {
      console.error('Unregistration failed:', error);
      alert(error.response?.data?.message || 'Unregistration failed');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        // Handle existing image path or new file
        if (key === 'image' && formData[key]) {
          data.append('image', formData[key]);
        } else if (key !== 'banner_url' && key !== 'image') {
           data.append(key, formData[key]); 
        }
      });
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      };

      const response = await axios.put(`/api/events/${id}`, data, config);
      setEvent(response.data);
      setIsEditing(false);
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update event');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!event) return <div className="text-center mt-20">Event not found</div>;

  const isOrganizer = user && (user.id === event.organizer_id || user.role === 'admin');
  const eventDate = new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const eventTime = new Date(event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const regDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
  const isRegClosed = regDeadline && regDeadline < new Date();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner Image */}
      <div className="h-64 md:h-80 w-full bg-gray-200 relative">
        <img 
          src={event.banner_url || 'https://images.unsplash.com/photo-1504384308090-c54be3855833?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="max-w-7xl mx-auto">
             <span className="bg-primary/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
               {event.club_name || 'Event'}
             </span>
             <h1 className="text-4xl md:text-5xl font-bold">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">About Event</h2>
                {isOrganizer && !isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-primary hover:text-indigo-700 font-medium"
                  >
                    <FaEdit /> Edit Event
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="5" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg"></textarea>
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Banner</label>
                    <input type="file" name="image" onChange={handleImageChange} accept="image/*" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="prose max-w-none text-gray-600">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Event Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-gray-600">
                  <FaCalendarAlt className="mt-1 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Date & Time</p>
                    <p>{eventDate} at {eventTime}</p>
                    {regDeadline && (
                      <p className="text-xs text-red-500 mt-1">
                        Register by: {regDeadline.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-gray-600">
                  <FaMapMarkerAlt className="mt-1 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-600">
                  <FaUser className="mt-1 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Organizer</p>
                    <p>{event.organizer_name || 'Event Organizer'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {!isOrganizer ? (

                    <>
                      {registered ? (
                        <>
                          <button 
                            disabled={true}
                            className="w-full py-3 rounded-xl font-bold text-white bg-green-500 cursor-default shadow-lg flex items-center justify-center gap-2 mb-3"
                          >
                             <FaCheck /> Registered
                          </button>
                          {!isRegClosed && (
                            <button 
                              onClick={handleUnregister}
                              className="w-full py-2 rounded-xl font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors text-sm"
                            >
                              Unregister
                            </button>
                          )}
                        </>
                      ) : (
                        <button 
                          onClick={handleRegister}
                          disabled={isRegClosed}
                          className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                            isRegClosed
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-primary to-secondary hover:shadow-primary/30 transform hover:-translate-y-0.5'
                          }`}
                        >
                          {isRegClosed ? 'Registration Closed' : 'Register Now'}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium border border-indigo-100">
                      You are managing this event
                    </div>
                  )}
                </div>
              </div>
            </motion.div>


              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate(`/view-event/${id}/submissions`)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-medium text-gray-700 flex items-center justify-between"
                  >
                    View Submissions <span className="text-gray-400">&rarr;</span>
                  </button>

                  <button 
                    onClick={() => navigate(`/view-event/${id}/rules`)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-medium text-gray-700 flex items-center justify-between"
                  >
                     Event Rules <span className="text-gray-400">&rarr;</span>
                  </button>

                  {/* Submission Logic: Participant only, and checks deadline */}
                  {!isOrganizer && user && (
                    <>
                      {(!event.submission_deadline || new Date(event.submission_deadline) > new Date()) ? (
                         <button 
                          onClick={() => navigate(`/view-event/${id}/submit`)}
                          className="w-full text-left px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors font-medium text-indigo-700 flex items-center justify-between border border-indigo-100"
                        >
                          Submit Project <span className="text-indigo-400">&rarr;</span>
                        </button>
                      ) : (
                         <div className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium text-sm flex items-center justify-center border border-red-100">
                          Submissions Closed
                        </div>
                      )}
                    </>
                  )}

                  {/* Report Issue: Logged in users */}
                  {user && (
                    <button 
                      onClick={() => navigate(`/view-event/${id}/report`)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-white hover:bg-red-50 transition-colors font-medium text-red-600 border border-transparent hover:border-red-100 flex items-center justify-between"
                    >
                      Report an Issue <span className="text-red-300">&rarr;</span>
                    </button>
                  )}
                </div>
              </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewEventDetails;
