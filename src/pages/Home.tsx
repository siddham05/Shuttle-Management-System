import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin, Clock, Shield, CreditCard, Users } from 'lucide-react';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('https://p4nuoxoppyoj4oiinisjbumwvy0vrxlx.lambda-url.ap-south-1.on.aws/default/ShuttleHelloWorld')
      .then(response => response.json())
      .then(data => {
        console.log(data); // Check in console
        setMessage(data.message); // Assuming your Lambda returns { message: "Hello from Lambda" }
      })
      .catch(error => {
        console.error('Error fetching Lambda:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80")',
            zIndex: -1
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
              Campus Shuttle Service
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Efficient, sustainable, and convenient transportation for students and staff.
              Book your rides, track shuttles, and manage your travel all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Users className="h-5 w-5 mr-2" />
                Student Login
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Message Section */}
      <div className="flex flex-col items-center justify-center py-12 bg-white">
        <h2 className="text-3xl font-bold mb-4">Campus Shuttle System</h2>
        <p className="text-lg">Message from server: {message || 'Loading...'}</p>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Campus Shuttle?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience seamless campus transportation with our modern shuttle service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-time Tracking */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-6 shadow-md">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Real-time Tracking
              </h3>
              <p className="text-gray-600">
                Track shuttle locations in real-time and never miss your ride. Get accurate
                ETAs and route information.
              </p>
            </div>

            {/* Easy Booking */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-6 shadow-md">
                <Bus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Easy Booking
              </h3>
              <p className="text-gray-600">
                Book your rides with just a few taps. Choose your route, time, and
                destination effortlessly.
              </p>
            </div>

            {/* Point System */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-6 shadow-md">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Point System
              </h3>
              <p className="text-gray-600">
                Earn and use points for your rides. Get rewards for frequent usage and
                enjoy special benefits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Regular Shuttle Schedule
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-5 w-5 mr-3 text-blue-600" />
                    <span className="font-medium">Morning Routes</span>
                    <span className="ml-auto">7:00 AM - 11:00 AM</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-5 w-5 mr-3 text-blue-600" />
                    <span className="font-medium">Afternoon Routes</span>
                    <span className="ml-auto">12:00 PM - 4:00 PM</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-5 w-5 mr-3 text-blue-600" />
                    <span className="font-medium">Evening Routes</span>
                    <span className="ml-auto">5:00 PM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Campus"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              Ready to Get Started?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Bus className="h-5 w-5 mr-2" />
                Book Your Ride Now
              </Link>
              <Link
                to="/dashboard/routes"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
              >
                <MapPin className="h-5 w-5 mr-2" />
                View Routes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white p-2 rounded-lg">
                  <Bus className="h-6 w-6 text-blue-600" />
                </div>
                <span className="ml-3 text-xl font-bold text-white">
                  Campus Shuttle
                </span>
              </div>
              <p className="text-sm">
                Providing safe and efficient transportation solutions for our university
                community.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/routes"
                    className="hover:text-white transition-colors"
                  >
                    View Routes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>Email: siddhamj5@gmail.com</li>
                <li>Phone: 9458424989</li>
                <li>Emergency: 9458424989</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
              <ul className="space-y-2">
                <li>Monday - Friday: 7:00 AM - 9:00 PM</li>
                <li>Saturday: 8:00 AM - 6:00 PM</li>
                <li>Sunday: 9:00 AM - 5:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Campus Shuttle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}