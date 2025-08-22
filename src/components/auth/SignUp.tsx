'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpForm() {
    const [name, setName] = useState(""); // Changed from username to name
    const [phone, setPhone] = useState(""); // Changed from phoneNumber to phone
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        // Basic validation
        if (!name || !email || !phone || !role || !password) {
            setError("Please fill in all required fields");
            return;
        }
        
        // Phone number validation (10 digits)
        if (!/^\d{10}$/.test(phone)) {
            setError("Phone number must be 10 digits");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, // Changed from username
                    phone, // Changed from phoneNumber
                    email,
                    password,
                    role
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Redirect to login page on successful registration
                router.push('./login');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    const handleNavigateToLogin = () => {
        router.push('./login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
                        <p className="text-gray-200">Get started with a new account in seconds.</p>
                    </div>
                    
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg backdrop-blur-sm">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-200 font-medium">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-200 font-medium">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Enter your 10-digit phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-200 font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-gray-200 font-medium">
                                I am a
                            </Label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            >
                                <option value="student" className="text-black">Student</option>
                                <option value="business" className="text-black">Business</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-200 font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                required
                            />
                        </div>
                        
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95"
                        >
                            Create Account
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <p className="text-gray-200">
                            Already have an account?{" "}
                            <button
                                onClick={handleNavigateToLogin}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                            >
                                Log In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}