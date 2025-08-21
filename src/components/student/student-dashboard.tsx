"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Edit3, X, FileText, Download, Paperclip, Loader2, Calendar } from "lucide-react"

interface Achievement {
    id: string
    text: string
    file?: File
    timestamp: Date
}

interface Certificate {
    id: string
    name: string
    file: File
}

export function StudentDashboard() {
    const router = useRouter()
    const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js"])
    const [newSkill, setNewSkill] = useState("")
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [achievements, setAchievements] = useState<Achievement[]>([
        {
            id: "1",
            text: "Completed Advanced React Course with 95% score! Really excited to apply these new concepts in my upcoming projects.",
            timestamp: new Date("2025-08-20"),
        },
        {
            id: "2",
            text: "Built my first full-stack application using Next.js and PostgreSQL. The project includes user authentication, real-time updates, and responsive design.",
            timestamp: new Date("2025-08-18"),
        },
    ])
    const [newAchievement, setNewAchievement] = useState("")
    const [achievementFile, setAchievementFile] = useState<File | null>(null)
    const [isPosting, setIsPosting] = useState(false)
    const [profileImage, setProfileImage] = useState<string>("")

    const profileUploadRef = useRef<HTMLInputElement>(null)
    const certificateUploadRef = useRef<HTMLInputElement>(null)
    const achievementFileRef = useRef<HTMLInputElement>(null)

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newSkill.trim()) {
            setSkills([...skills, newSkill.trim()])
            setNewSkill("")
        }
    }

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((skill) => skill !== skillToRemove))
    }

    const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            Array.from(files).forEach((file) => {
                const newCertificate: Certificate = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    file,
                }
                setCertificates((prev) => [...prev, newCertificate])
            })
        }
    }

    const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAchievementFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAchievementFile(file)
        }
    }

    const postAchievement = async () => {
        if (!newAchievement.trim()) return

        setIsPosting(true)

        // Simulate posting delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const achievement: Achievement = {
            id: Date.now().toString(),
            text: newAchievement,
            file: achievementFile || undefined,
            timestamp: new Date(),
        }

        setAchievements([achievement, ...achievements])
        setNewAchievement("")
        setAchievementFile(null)
        setIsPosting(false)

        if (achievementFileRef.current) {
            achievementFileRef.current.value = ""
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const handleEditProfile = () => {
        router.push("/dashboard/student/edit-profile")
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Static Information */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative group cursor-pointer" onClick={() => profileUploadRef.current?.click()}>
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage src={profileImage || "/placeholder.svg"} />
                                            <AvatarFallback className="text-xl bg-blue-100 text-blue-600">JS</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <input
                                            ref={profileUploadRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileImageUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h2 className="text-2xl font-semibold text-gray-800">John Smith</h2>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p>
                                                <span className="font-medium">School:</span> Tech University
                                            </p>
                                            <p>
                                                <span className="font-medium">College:</span> Computer Science
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEditProfile}
                                        className="hover:scale-105 transition-transform duration-200 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills Card */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-800">My Skills</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Type a skill and press Enter"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={addSkill}
                                    className="focus:border-blue-500 focus:ring-blue-500"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200"
                                        >
                                            {skill}
                                            <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-blue-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Certificates Card */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-800">My Certificates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={() => certificateUploadRef.current?.click()}
                                    variant="outline"
                                    className="w-full hover:scale-105 transition-transform duration-200 border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Certificate
                                </Button>
                                <input
                                    ref={certificateUploadRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    onChange={handleCertificateUpload}
                                    className="hidden"
                                />

                                <div className="space-y-2">
                                    {certificates.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <span className="text-sm font-medium text-gray-700 truncate">{cert.name}</span>
                                            </div>
                                            <Button size="sm" variant="ghost" className="hover:bg-blue-100">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Dynamic Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Share Achievement Card */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-800">What have you accomplished?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Write about your new certificate, project, or achievement..."
                                    value={newAchievement}
                                    onChange={(e) => setNewAchievement(e.target.value)}
                                    className="min-h-[100px] focus:border-blue-500 focus:ring-blue-500"
                                />

                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => achievementFileRef.current?.click()}
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Paperclip className="w-4 h-4 mr-2" />
                                        Attach File
                                        {achievementFile && (
                                            <Badge variant="secondary" className="ml-2">
                                                {achievementFile.name}
                                            </Badge>
                                        )}
                                    </Button>
                                    <input
                                        ref={achievementFileRef}
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleAchievementFileUpload}
                                        className="hidden"
                                    />

                                    <Button
                                        onClick={postAchievement}
                                        disabled={!newAchievement.trim() || isPosting}
                                        className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                                    >
                                        {isPosting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            "Post"
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievements Timeline */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-800">My Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {achievements.map((achievement, index) => (
                                    <Card
                                        key={achievement.id}
                                        className={`shadow-sm hover:shadow-md transition-all duration-200 ${index === 0 ? "animate-fade-in-up" : ""
                                            }`}
                                    >
                                        <CardContent className="p-4">
                                            <p className="text-gray-700 mb-3 leading-relaxed">{achievement.text}</p>

                                            {achievement.file && (
                                                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-gray-700">{achievement.file.name}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Posted on {formatDate(achievement.timestamp)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentDashboard;