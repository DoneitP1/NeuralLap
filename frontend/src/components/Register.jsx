import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onSwitchToLogin, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const { register, error, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(email, password, fullName);
        if (success) {
            onSwitchToLogin(); // Ask them to login after register
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-xl w-full max-w-md shadow-2xl">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 mb-6">
                    New Pilot Registration
                </h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Pilot Name</label>
                        <input
                            type="text"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-green-500"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-green-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-green-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded transition-all transform hover:scale-[1.02] disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    Already a pilot? <button onClick={onSwitchToLogin} className="text-green-400 hover:underline">Login</button>
                </div>
                <div className="mt-2 text-center text-sm text-gray-600">
                    <button onClick={onClose} className="hover:text-white">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default Register;
