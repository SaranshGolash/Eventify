import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Eventify
            </span>
            <p className="text-gray-500 mt-2 text-sm">Empowering Campus Communities</p>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-xl"><FaGithub /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-xl"><FaTwitter /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-xl"><FaLinkedin /></a>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Eventify. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;