import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, GraduationCap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-full bg-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 font-sans">JobConnect Platform</h1>
          <p className="text-xl text-slate-600">Connect businesses with talented students</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">Business Portal</CardTitle>
              <CardDescription className="text-base">
                Post jobs, review applications, and connect with students
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• Manage job postings</li>
                <li>• Review student applications</li>
                <li>• Chat with accepted candidates</li>
                <li>• Track application analytics</li>
              </ul>
              <Link href="/dashboard/business">
                <Button className="w-full">Access Business Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">Student Portal</CardTitle>
              <CardDescription className="text-base">
                Explore opportunities and apply to your dream jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>• Browse available jobs</li>
                <li>• Submit applications with proposals</li>
                <li>• Track application status</li>
                <li>• Chat with potential employers</li>
              </ul>
              <Link href="/dashboard/student">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Access Student Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
