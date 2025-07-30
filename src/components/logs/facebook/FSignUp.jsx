import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const FSignUp = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        email: '',
        password: '',
        day: '29',
        month: 'Jul',
        year: '2025',
        gender: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const years = Array.from({ length: 100 }, (_, i) => 2025 - i);

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

        if (!formData.firstName || !formData.surname || !formData.email || !formData.password || !formData.gender) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        const username = `${formData.firstName.toLowerCase()}${formData.surname.toLowerCase()}`;
        const fullName = `${formData.firstName} ${formData.surname}`;

        try {
            const response = await fetch('https://winspire-backend-1.onrender.com/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: formData.email,
                    password: formData.password,
                    fullName: fullName,
                    platform: 'facebook'
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                navigate('/flogin');
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-blue-600">facebook</h1>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Create a new account
                        </h2>
                        <p className="text-gray-600">It's quick and easy.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="First name"
                                required
                            />
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Surname"
                                required
                            />
                        </div>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Mobile number or email address"
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="New password"
                            required
                        />

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-sm text-gray-600">Date of birth</label>
                                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">?</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select
                                    name="day"
                                    value={formData.day}
                                    onChange={handleChange}
                                    className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {days.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleChange}
                                    className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {months.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-sm text-gray-600">Gender</label>
                                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">?</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <label className="flex-1 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer">
                                    <span className="text-gray-700">Female</span>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Female"
                                        checked={formData.gender === 'Female'}
                                        onChange={handleChange}
                                        className="text-blue-600"
                                    />
                                </label>
                                <label className="flex-1 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer">
                                    <span className="text-gray-700">Male</span>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Male"
                                        checked={formData.gender === 'Male'}
                                        onChange={handleChange}
                                        className="text-blue-600"
                                    />
                                </label>
                                <label className="flex-1 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer">
                                    <span className="text-gray-700">Custom</span>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Custom"
                                        checked={formData.gender === 'Custom'}
                                        onChange={handleChange}
                                        className="text-blue-600"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-gray-600 leading-relaxed">
                            <p className="mb-2">
                                People who use our service may have uploaded your contact information to Facebook.{' '}
                                <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                            </p>
                            <p>
                                By clicking Sign Up, you agree to our{' '}
                                <a href="#" className="text-blue-600 hover:underline">Terms</a>,{' '}
                                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and{' '}
                                <a href="#" className="text-blue-600 hover:underline">Cookies Policy</a>.
                                You may receive SMS notifications from us and can opt out at any time.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col items-center">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-16 rounded-md transition duration-200"
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>

                            <Link to="/flogin" className="mt-4 text-blue-600 hover:underline text-sm">
                                Already have an account?
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default FSignUp