import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event, index }) => {
  const eventDate = new Date(event.start_time).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
  const eventImage = event.banner_url || 'https://images.unsplash.com/photo-1504384308090-c54be3855833?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  const organizerName = event.club_name || event.organizer_name || 'Event Organizer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={eventImage}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
          {organizerName}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-secondary" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-secondary" />
            <span>{event.location}</span>
          </div>
        </div>

        <button className="w-full mt-6 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200">
          View Details
        </button>
      </div>
    </motion.div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Events</h1>
            <p className="text-gray-500">Explore what's happening on campus</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto items-center">
            {user && (
              <Link to="/events/create" className="px-4 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 hover:bg-indigo-600 transition-all mr-2">
                <FaPlus /> <span className="hidden sm:inline">Create Event</span>
              </Link>
            )}
            <div className="relative flex-grow md:flex-grow-0">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64"
              />
            </div>
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              <FaFilter />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
            {events.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                No events found. Be the first to create one!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
