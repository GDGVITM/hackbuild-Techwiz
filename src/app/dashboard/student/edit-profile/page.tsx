"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Upload, Save } from "lucide-react"

export default function EditProfile() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "John Smith",
        school: "Tech University",
        college: "Computer Science",
        email: "john.smith@techuni.edu",
        phone: "+1 (555) 123-4567",
        bio: "Passionate computer science student with a focus on web development and AI.",
    })
    const [profileImage, setProfileImage] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate save operation
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsSaving(false)
        router.push("/")
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.push("/dashboard/student")} className="hover:bg-gray-100">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-gray-800">Edit Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative group cursor-pointer">
                                <Avatar className="w-32 h-32">
                                    <AvatarImage src={profileImage || "/placeholder.svg"} />
                                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">JS</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <p className="text-sm text-gray-600">Click to change profile picture</p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="school">School</Label>
                                <Input
                                    id="school"
                                    name="school"
                                    value={formData.school}
                                    onChange={handleInputChange}
                                    className="focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="college">College</Label>
                                <Input
                                    id="college"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleInputChange}
                                    className="focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Input
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className="focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/")}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                            >
                                {isSaving ? (
                                    <>
                                        <Save className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
