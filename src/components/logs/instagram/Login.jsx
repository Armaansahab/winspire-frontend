import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleChange = (e) => {
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

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: formData.identifier,
                    password: formData.password,
                    platform: 'instagram'
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                navigate('/instagram-home');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-sm border border-gray-700 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-white text-4xl font-thin italic">Instagram</h1>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            placeholder="Phone number, username, or email"
                            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                            required
                        />
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-semibold text-sm hover:text-gray-300"
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors"
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-700"></div>
                    <span className="px-4 text-gray-500 text-sm font-semibold">OR</span>
                    <div className="flex-1 border-t border-gray-700"></div>
                </div>

                <button className="w-full flex items-center justify-center space-x-2 text-blue-400 hover:text-blue-300 font-semibold py-2 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Log in with Facebook</span>
                </button>

                <div className="text-center mt-6">
                    <a href="#" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                        Forgot password?
                    </a>
                </div>

                <div className="text-center mt-8 text-white">
                    <span className="text-gray-400">Don't have an account? </span>
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login