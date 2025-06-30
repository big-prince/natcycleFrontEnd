import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full shadow-lg">
            <FiAlertTriangle className="w-16 h-16 text-red-500" />
          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-8xl md:text-9xl font-bold text-gray-800 mb-4 tracking-tight"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6"
          >
            Page Not Found
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto mb-6">
            Sorry, we couldn't find the page you're looking for. It might have
            been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="font-medium mb-1">What you can do:</p>
            <ul className="text-left space-y-1 max-w-xs mx-auto">
              <li>• Check the URL for typos</li>
              <li>• Go back to the homepage</li>
              <li>• Use the navigation menu</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4"
        >
          <Link
            to="/home"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            <FiHome className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <button
              onClick={() => window.history.back()}
              className="hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              ← Go Back
            </button>
            <span>•</span>
            <Link
              to="/contact"
              className="hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Contact Support
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-xs text-gray-400">
            Error Code: 404 • Page Not Found
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
