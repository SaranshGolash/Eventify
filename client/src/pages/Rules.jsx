import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaEdit, FaSave } from 'react-icons/fa';

const Rules = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rules, setRules] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${id}`);
        setEventData(response.data);
        setRules(response.data.rules || '');
      } catch (error) {
        console.error('Error fetching rules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/events/${id}`, { rules }, config);
      setIsEditing(false);
      alert('Rules updated successfully!');
    } catch (error) {
      console.error('Failed to update rules:', error);
      alert('Failed to update rules');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;

  const isOrganizer = user && eventData && (user.id === eventData.organizer_id || user.role === 'admin');

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium">
          <FaArrowLeft className="mr-2" /> Back to Event
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Event Rules</h1>
            {isOrganizer && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-primary hover:text-indigo-700 font-medium"
              >
                <FaEdit /> Edit Rules
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea 
                rows="10"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Enter event rules here..."
              ></textarea>
              <div className="flex gap-3">
                <button 
                  onClick={handleSave}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <FaSave /> Save Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none text-gray-700">
              {rules ? (
                <p className="whitespace-pre-wrap">{rules}</p>
              ) : (
                <p className="text-gray-500 italic">No specific rules mentioned for this event.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rules;
