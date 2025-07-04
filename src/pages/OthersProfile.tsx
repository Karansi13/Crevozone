"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, Skill, Certificate } from "@/types"
import {
  Award,
  File,
  Layout,
  Database,
  Phone,
  Palette,
  Code,
  Briefcase,
  LineChart,
  Brain,
  Shield,
  Server,
  Cloud,
  Link2,
  Wifi,
  Gamepad,
  Glasses,
  Video,
  Megaphone,
  Pen,
  DollarSign,
  Github,
  Linkedin,
  Code2,
  Globe,
  FileText,
  Loader,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type React from "react"

const skillCategories: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: "frontend", label: "Frontend", icon: <Layout className="h-5 w-5 text-blue-500" /> },
  { id: "backend", label: "Backend", icon: <Database className="h-5 w-5 text-green-500" /> },
  { id: "mobile", label: "Mobile", icon: <Phone className="h-5 w-5 text-purple-500" /> },
  { id: "ui/ux", label: "UI/UX", icon: <Palette className="h-5 w-5 text-pink-500" /> },
  { id: "product", label: "Product", icon: <Code className="h-5 w-5 text-indigo-500" /> },
  { id: "business", label: "Business", icon: <Briefcase className="h-5 w-5 text-yellow-500" /> },
  { id: "data", label: "Data", icon: <LineChart className="h-5 w-5 text-red-500" /> },
  { id: "ai_ml", label: "AI/ML", icon: <Brain className="h-5 w-5 text-orange-500" /> },
  { id: "cybersecurity", label: "Cybersecurity", icon: <Shield className="h-5 w-5 text-teal-500" /> },
  { id: "devops", label: "DevOps", icon: <Server className="h-5 w-5 text-gray-500" /> },
  { id: "cloud", label: "Cloud Computing", icon: <Cloud className="h-5 w-5 text-cyan-500" /> },
  { id: "blockchain", label: "Blockchain", icon: <Link2 className="h-5 w-5 text-lime-500" /> },
  { id: "iot", label: "IoT", icon: <Wifi className="h-5 w-5 text-amber-500" /> },
  { id: "game_dev", label: "Game Development", icon: <Gamepad className="h-5 w-5 text-fuchsia-500" /> },
  { id: "ar_vr", label: "AR/VR", icon: <Glasses className="h-5 w-5 text-emerald-500" /> },
  { id: "content_creation", label: "Content Creation", icon: <Video className="h-5 w-5 text-rose-500" /> },
  { id: "marketing", label: "Marketing", icon: <Megaphone className="h-5 w-5 text-purple-600" /> },
  { id: "writing", label: "Writing", icon: <Pen className="h-5 w-5 text-blue-600" /> },
  { id: "finance", label: "Finance", icon: <DollarSign className="h-5 w-5 text-green-600" /> },
]

export default function UserProfile() {
  const { erpId } = useParams<{ erpId: string }>()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Partial<User> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!erpId) return

      setLoading(true)
      setError(null)
      try {
        const usersRef = collection(db, "users")
        const q = query(usersRef, where("erpId", "==", erpId))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setError("User not found")
          setProfile(null)
        } else {
          const userData = querySnapshot.docs[0].data() as User
          setProfile(userData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [erpId])

  const renderSkillLevelIndicator = (level: string) => {
    const levelColors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    }
    return (
      <Badge variant="secondary" className={levelColors[level as keyof typeof levelColors]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen"><Loader /></div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto p-12 mt-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "An unexpected error occurred"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-12 mt-10">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.photoURL} alt={profile.name} />
              <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-bold">{profile.displayName}</CardTitle>
              <p className="text-gray-500">{profile.erpId}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Academic Information</h2>
              <p>
                <strong>Branch:</strong> {profile.branch}
              </p>
              <p>
                <strong>Year:</strong> {profile.year}
              </p>
              <p>
                <strong>Experience Level:</strong> {profile.experience}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.skills?.map((skill: Skill, index: number) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
                  {skillCategories.find((cat) => cat.id === skill.category)?.icon}
                  <div>
                    <p className="font-medium">{skill.name}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{skill.category}</span>
                      {renderSkillLevelIndicator(skill.level)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {profile.achievements?.map((achievement: string, index: number) => (
                <li key={index} className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {profile.certificates?.map((cert: Certificate, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <File className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-sm text-gray-500">
                      {cert.issuer} - {new Date(cert.dateIssued).toLocaleDateString()}
                    </p>
                    {cert.certificateUrl && (
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Resume</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.resume ? (
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Resume</p>
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No resume uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
            )}
            {profile.leetcodeUrl && (
              <a
                href={profile.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Code2 className="h-5 w-5" />
                <span>LeetCode</span>
              </a>
            )}
            {profile.gfgUrl && (
              <a
                href={profile.gfgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Code2 className="h-5 w-5" />
                <span>GeeksForGeeks</span>
              </a>
            )}
            {profile.codechefUrl && (
              <a
                href={profile.codechefUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Code2 className="h-5 w-5" />
                <span>CodeChef</span>
              </a>
            )}
            {profile.hackerrankUrl && (
              <a
                href={profile.hackerrankUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Code2 className="h-5 w-5" />
                <span>HackerRank</span>
              </a>
            )}
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Globe className="h-5 w-5" />
                <span>Portfolio</span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

