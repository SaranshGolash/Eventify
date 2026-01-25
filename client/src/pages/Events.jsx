import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaPlus, FaCheck } from 'react-icons/fa';
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
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
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

        <Link to={`/view-event/${event.id}`} className="block text-center w-full mt-6 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200">
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

  // Filter Logic
  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      event.title.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower);
      
    const eventTime = new Date(event.start_time).getTime();
    const now = Date.now();
    let matchesFilter = true;

    if (filterType === 'upcoming') {
      matchesFilter = eventTime >= now;
    } else if (filterType === 'past') {
      matchesFilter = eventTime < now;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Events</h1>
            <p className="text-gray-500">Explore what's happening on campus</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto items-center z-20">
            {user && (
              <Link to="/events/create" className="px-4 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 hover:bg-indigo-600 transition-all mr-2">
                <FaPlus /> <span className="hidden sm:inline">Create Event</span>
              </Link>
            )}
            
            {/* Search Input */}
            <div className="relative flex-grow md:flex-grow-0">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64"
              />
            </div>

            {/* Filter Button & Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`px-4 py-2.5 border rounded-xl flex items-center gap-2 transition-all ${showFilterMenu ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <FaFilter />
                <span className="hidden sm:inline">Filter</span>
              </button>

              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-1">
                      {['all', 'upcoming', 'past'].map((type) => (
                        <button
                          key={type}
                          onClick={() => { setFilterType(type); setShowFilterMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-50 flex justify-between items-center text-gray-700 capitalize"
                        >
                          {type === 'all' ? 'All Events' : `${type} Events`}
                          {filterType === type && <FaCheck className="text-primary text-xs" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </AnimatePresence>
            
            {!loading && filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-medium">No events found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
