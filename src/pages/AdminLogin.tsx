import React from 'react';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // Check if user is admin after login
      const { data: userData } = await useAuthStore.getState().initialize();
      if (userData?.role !== 'admin') {
        await useAuthStore.getState().signOut();
        setError('Access denied. Admin privileges required.');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Restricted access - Administrators only
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/50 border border-red-700/50 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-700/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-700/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Sign in to Admin Portal
          </button>

          <div className="text-center space-y-2">
            <a
              href="/admin/signup"
              className="block text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              Create Admin Account →
            </a>
            <a
              href="/login"
              className="block text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              Student Login →
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}