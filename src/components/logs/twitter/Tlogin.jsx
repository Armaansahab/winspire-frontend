import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const TLogin = () => {
    const [step, setStep] = useState(1); 
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

    const handleNext = () => {
        if (!formData.identifier.trim()) {
            setError('Please enter your phone, email, or username');
            return;
        }
        setStep(2);
    };

    const handleLogin = async () => {
        if (!formData.password.trim()) {
            setError('Please enter your password');
            return;
        }

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
                    platform: 'twitter'
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/twitter-home');
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 1) {
            handleNext();
        } else {
            handleLogin();
        }
    };

    const handleBack = () => {
        setStep(1);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
            <div className="bg-black rounded-2xl p-8 w-full max-w-md relative">
                {step === 1 ? (
                    <Link 
                        to="/"
                        className="absolute top-4 left-4 text-white hover:bg-gray-900 rounded-full p-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                ) : (
                    <button 
                        onClick={handleBack}
                        className="absolute top-4 left-4 text-white hover:bg-gray-900 rounded-full p-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}

                <div className="text-center mb-8">
                    <div className="inline-block">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-white text-2xl font-bold text-center mb-8">
                    {step === 1 ? 'Sign in to X' : 'Enter your password'}
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <>
                        <div className="space-y-4 mb-6">
                            <button className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 px-4 rounded-full flex items-center justify-center transition duration-200">
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </button>

                            <button className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 px-4 rounded-full flex items-center justify-center transition duration-200">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C6.624 0 2.248 4.376 2.248 9.769c0 1.044.168 2.049.48 2.985L.169 15.313c-.44.44-.44 1.154 0 1.594l.806.806c.22.22.508.33.797.33.289 0 .577-.11.797-.33l2.559-2.559c.936.312 1.941.48 2.985.48 5.393 0 9.769-4.376 9.769-9.769S17.41 0 12.017 0zm0 17.538c-4.283 0-7.769-3.486-7.769-7.769S7.734 2 12.017 2s7.769 3.486 7.769 7.769-3.486 7.769-7.769 7.769z" />
                                </svg>
                                Sign in with Apple
                            </button>
                        </div>

                        <div className="text-center text-gray-500 mb-6">
                            or
                        </div>
                    </>
                )}

                <form onSubmit={handleSubmit} className="mb-6">
                    {step === 1 ? (
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-gray-600 rounded text-white px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition duration-200 mb-4"
                            placeholder="Phone, email address, or username"
                            required
                        />
                    ) : (
                        <>
                            <div className="mb-4 p-3 bg-gray-900 rounded text-white text-sm">
                                Signing in as: <span className="font-medium">{formData.identifier}</span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border border-gray-600 rounded text-white px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition duration-200 mb-4"
                                placeholder="Password"
                                required
                                autoFocus
                            />
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (step === 1 ? !formData.identifier.trim() : !formData.password.trim())}
                        className="w-full bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-full mb-4 transition duration-200"
                    >
                        {loading ? 'Signing in...' : (step === 1 ? 'Next' : 'Log in')}
                    </button>
                </form>

                {step === 1 && (
                    <button className="w-full border border-gray-600 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-full mb-16 transition duration-200">
                        Forgot password?
                    </button>
                )}

                <div className="text-center text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/tsignup" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default TLogin