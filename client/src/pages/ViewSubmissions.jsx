import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';

const ViewSubmissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, submissionsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/events/${id}`),
          axios.get(`http://localhost:5000/api/events/${id}/submissions`)
        ]);
        setEventTitle(eventRes.data.title);
        setSubmissions(submissionsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium">
          <FaArrowLeft className="mr-2" /> Back to Event
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold mb-2">Project Submissions</h1>
          <p className="text-gray-500 mb-8">for {eventTitle}</p>

          {submissions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
              No submissions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{sub.user_name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{sub.user_email}</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{sub.description}</p>
                    </div>
                    {sub.project_link && (
                      <a 
                        href={sub.project_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white border border-gray-200 text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
                      >
                         View Project <FaExternalLinkAlt size={12} />
                      </a>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Submitted on {new Date(sub.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissions;
