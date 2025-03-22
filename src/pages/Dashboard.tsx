import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Bus, Map, History, LogOut, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const BookShuttle = React.lazy(() => import('../components/BookShuttle'));
const RouteMap = React.lazy(() => import('../components/RouteMap'));
const TripHistory = React.lazy(() => import('../components/TripHistory'));
const Profile = React.lazy(() => import('../components/Profile'));

export default function Dashboard() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = user?.role === 'admin' 
    ? [
        { name: 'Profile', href: '/dashboard/profile', icon: User },
      ]
    : [
        { name: 'Book Shuttle', href: '/dashboard', icon: Bus },
        { name: 'Route Map', href: '/dashboard/routes', icon: Map },
        { name: 'Trip History', href: '/dashboard/history', icon: History },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Bus className="h-8 w-8 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  Campus Shuttle
                </span>
              </div>
              
              <div className="hidden md:ml-8 md:flex md:space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="hidden md:flex items-center space-x-4">
                  {user?.role !== 'admin' && (
                    <div className="text-sm">
                      <span className="text-gray-500">Points:</span>{' '}
                      <span className="font-medium text-blue-600">
                        {user?.points}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  >
                    {isMobileMenuOpen ? (
                      <X className="block h-6 w-6" />
                    ) : (
                      <Menu className="block h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              ))}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                {user?.role !== 'admin' && (
                  <div className="text-sm">
                    <span className="text-gray-500">Points:</span>{' '}
                    <span className="font-medium text-blue-600">{user?.points}</span>
                  </div>
                )}
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin text-blue-600">
                <Bus size={48} />
              </div>
            </div>
          }
        >
          <Routes>
            {user?.role !== 'admin' && (
              <>
                <Route path="/" element={<BookShuttle />} />
                <Route path="/routes" element={<RouteMap />} />
                <Route path="/history" element={<TripHistory />} />
              </>
            )}
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to={user?.role === 'admin' ? "/dashboard/profile" : "/dashboard"} />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
}