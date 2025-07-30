import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password || !formData.fullName || !formData.username) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://winspire-backend-1.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          platform: 'instagram'
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="border border-gray-700 bg-black p-8 mb-4">
          <div className="text-center mb-6">
            <h1 className="text-white text-4xl font-thin italic">Instagram</h1>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-400 text-base font-medium">
              Sign up to see photos and videos<br />
              from your friends.
            </p>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded flex items-center justify-center space-x-2 mb-6 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Log in with Facebook</span>
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-500 text-sm font-semibold">OR</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500"
              required
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500"
              required
            />

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500"
              required
            />

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500"
              required
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <div className="text-center mb-4">
            <p className="text-gray-400 text-xs leading-4">
              People who use our service may have uploaded<br />
              your contact information to Instagram.{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Learn More
              </a>
            </p>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-400 text-xs leading-4">
              By signing up, you agree to our{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Terms</a>
              {' '}, <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
              {' '}and <a href="#" className="text-blue-400 hover:text-blue-300">Cookies Policy</a>.
            </p>
          </div>
        </div>

        <div className="border border-gray-700 bg-black p-6 text-center">
          <p className="text-white">
            Have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp;