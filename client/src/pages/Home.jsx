import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaClipboardList, FaArrowRight } from 'react-icons/fa';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-default"
  >
    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary text-3xl mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-6 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 font-medium text-sm border border-indigo-100"
            >
              🚀 The Ultimate Campus Platform
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8"
            >
              Manage Events & Clubs <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Like a Pro</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Centralize campus resources, streamline approvals, and boost student engagement with Eventify. Your all-in-one solution for a vibrant campus life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-indigo-600 transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
              >
                Get Started Now <FaArrowRight />
              </Link>
              <Link
                to="/events"
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all"
              >
                Explore Events
              </Link>
            </motion.div>
          </div>

          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-3xl -z-0 pointer-events-none"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              delay={0.2}
              icon={<FaCalendarAlt />}
              title="Event Lifecycle"
              description="Create, approve, and manage events seamlessly. Track budgets and participation in real-time."
            />
            <FeatureCard
              delay={0.4}
              icon={<FaUsers />}
              title="Club Management"
              description="Empower student bodies with tools for membership, roles, and collaborative workflows."
            />
            <FeatureCard
              delay={0.6}
              icon={<FaClipboardList />}
              title="Resource Booking"
              description="Book rooms and equipment efficiently with conflict detection and automated approvals."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
