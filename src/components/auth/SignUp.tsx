"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignUpPageProps {
    onNavigateToLogin: () => void
}

export default function SignUpPage({ onNavigateToLogin }: SignUpPageProps) {
    const [username, setUsername] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
                        <p className="text-gray-300">Get started with a new account in seconds.</p>
                    </div>

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-white font-medium">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white font-medium">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
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
                        <p className="text-gray-300">
                            Already have an account?{" "}
                            <button
                                onClick={onNavigateToLogin}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                            >
                                Log In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
