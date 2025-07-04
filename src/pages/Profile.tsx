
"use client"

import { useState, useEffect } from "react"
import type { Team } from "@/types"
import { useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { db, storage } from "@/lib/firebase"
import { Button } from "@/components/ui/Button"
import { collection, query, where, getDocs, deleteDoc, arrayRemove } from "firebase/firestore"
import {
  Users,
  MessageCircle,
  LogOut,
  Edit,
  ChevronDown,
  ChevronUp,
  Star,
  Gamepad,
  Video,
  Megaphone,
  Pen,
  DollarSign,
  Glasses,
  Wifi,
  Cloud,
  Server,
  Shield,
  Brain,
  Link2,
  Upload,
  Award,
  File,
} from "lucide-react"
import type { User, Skill, SkillLevel, SkillCategory, ExperienceLevel, Certificate } from "@/types"
import {
  Code,
  Palette,
  Phone,
  Database,
  Layout,
  Briefcase,
  LineChart,
  Trash2,
  PlusCircle,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { Input } from "@/components/ui/input"
import { FormProgress } from "@/components/formProgress"
import { useFormCompletion } from "@/hooks/useFormCompletion"

const skillCategories: { id: SkillCategory; label: string; icon: React.ReactNode }[] = [
  { id: "frontend", label: "Frontend", icon: <Layout className="h-5 w-5 text-blue-500" /> },
  { id: "backend", label: "Backend", icon: <Database className="h-5 w-5 text-green-500" /> },
  { id: "mobile", label: "Mobile", icon: <Phone className="h-5 w-5 text-purple-500" /> },
  { id: "ui/ux", label: "UI/UX", icon: <Palette className="h-5 w-5 text-pink-500" /> },
  { id: "product", label: "Product", icon: <Code className="h-5 w-5 text-indigo-500" /> },
  { id: "business", label: "Business", icon: <Briefcase className="h-5 w-5 text-yellow-500" /> },
  { id: "data", label: "Data", icon: <LineChart className="h-5 w-5 text-red-500" /> },

  // New Categories
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

const skillLevels: SkillLevel[] = ["beginner", "intermediate", "advanced"]
const experienceLevels: ExperienceLevel[] = ["beginner", "intermediate", "advanced"]

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userTeams, setUserTeams] = useState<Team[]>([])
  const [profile, setProfile] = useState<Partial<User>>({})
  const [initialProfile, setInitialProfile] = useState<Partial<User>>({})

  const [newAchievement, setNewAchievement] = useState("")
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [newCertificate, setNewCertificate] = useState<Partial<Certificate>>({
    name: "",
    issuer: "",
    dateIssued: new Date(),
  })

  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: "",
    level: "beginner",
    category: "frontend",
  })

  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    skills: true,
    socialLinks: true,
    teams: true,
  })

  const completion = useFormCompletion(profile)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      setLoading(true)
      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User
          setProfile(userData)
          setInitialProfile(userData)
        } else {
          // If the user document doesn't exist, create a new one with default values
          const defaultProfile: Partial<User> = {
            bio: "",
            experience: "beginner" as ExperienceLevel,
            skills: [],
            branch: "",
            year: "",
            achievements: [],
            certificates: [],
            resume: "",
            githubUrl: "",
            linkedinUrl: "",
            leetcodeUrl: "",
            gfgUrl: "",
            hackerrankUrl: "",
            codechefUrl: "",
            portfolioUrl: "",
          }
          setProfile(defaultProfile)
          setInitialProfile(defaultProfile)
        }

        const teamsRef = collection(db, "teams")
        const teamsQuery = query(teamsRef, where("members", "array-contains", user.uid))
        const teamsSnapshot = await getDocs(teamsQuery)
        const teamsData = teamsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Team,
        )
        setUserTeams(teamsData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const docRef = doc(db, "users", user.uid)
      await updateDoc(docRef, profile)
      setInitialProfile(profile)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof User, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddSkill = () => {
    if (!newSkill.name) return

    setProfile((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill as Skill],
    }))

    setNewSkill({
      name: "",
      level: "beginner",
      category: "frontend",
    })
  }

  const handleRemoveSkill = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index),
    }))
  }

  const handleAddAchievement = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newAchievement.trim()) {
      setProfile((prev) => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement.trim()],
      }))
      setNewAchievement("")
    }
  }

  const handleRemoveAchievement = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      achievements: prev.achievements?.filter((_, i) => i !== index),
    }))
  }

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploadingResume(true)
    try {
      if (profile.resume) {
        const oldResumeRef = ref(storage, profile.resume)
        await deleteObject(oldResumeRef).catch(() => {})
      }

      const resumeRef = ref(storage, `resumes/${user.uid}/${file.name}`)
      await uploadBytes(resumeRef, file)
      const downloadURL = await getDownloadURL(resumeRef)

      setProfile((prev) => ({ ...prev, resume: downloadURL }))
      toast.success("Resume uploaded successfully")
    } catch (error) {
      console.error("Error uploading resume:", error)
      toast.error("Failed to upload resume")
    } finally {
      setUploadingResume(false)
    }
  }

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !newCertificate.name || !newCertificate.issuer) return

    setUploadingCertificate(true)
    try {
      const certificateRef = ref(storage, `certificates/${user.uid}/${file.name}`)
      await uploadBytes(certificateRef, file)
      const downloadURL = await getDownloadURL(certificateRef)

      const certificate: Certificate = {
        ...(newCertificate as Certificate),
        certificateUrl: downloadURL,
      }

      setProfile((prev) => ({
        ...prev,
        certificates: [...(prev.certificates || []), certificate],
      }))

      setNewCertificate({
        name: "",
        issuer: "",
        dateIssued: new Date(),
      })

      toast.success("Certificate uploaded successfully")
    } catch (error) {
      console.error("Error uploading certificate:", error)
      toast.error("Failed to upload certificate")
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleRemoveCertificate = async (index: number) => {
    const certificate = profile.certificates?.[index]
    if (!certificate?.certificateUrl) return

    try {
      const certificateRef = ref(storage, certificate.certificateUrl)
      await deleteObject(certificateRef)

      setProfile((prev) => ({
        ...prev,
        certificates: prev.certificates?.filter((_, i) => i !== index),
      }))

      toast.success("Certificate removed successfully")
    } catch (error) {
      console.error("Error removing certificate:", error)
      toast.error("Failed to remove certificate")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-300 w-64 mb-4 rounded"></div>
          <div className="h-6 bg-gray-200 w-48 rounded"></div>
        </div>
      </div>
    )
  }

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return

    try {
      const teamRef = doc(db, "teams", teamId)

      await updateDoc(teamRef, {
        members: arrayRemove(user.uid),
      })

      setUserTeams((prev) => prev.filter((team) => team.id !== teamId))

      toast.success("Successfully left the team")
    } catch (error) {
      console.error("Error leaving team:", error)
      toast.error("Failed to leave team")
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!user) return

    try {
      const teamRef = doc(db, "teams", teamId)
      const teamDoc = await getDoc(teamRef)

      if (teamDoc.exists() && teamDoc.data().createdBy === user.uid) {
        await deleteDoc(teamRef)

        setUserTeams((prev) => prev.filter((team) => team.id !== teamId))

        toast.success("Team deleted successfully")
      } else {
        toast.error("You do not have permission to delete this team")
      }
    } catch (error) {
      console.error("Error deleting team:", error)
      toast.error("Failed to delete team")
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const levelColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  }

  const renderSkillLevelIndicator = (level: SkillLevel) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[level]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    )
  }

  const extractLeetCodeUsername = (url: string): string | null => {
    const match = url.match(/leetcode\.com\/u\/([^/]+)/)
    return match ? match[1] : null
  }

  const extractGFGUsername = (url: string): string | null => {
    const match = url.match(/geeksforgeeks\.org\/user\/([^/]+)/)
    return match ? match[1] : null
  }

  const hasUnsavedChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile)

  return (
    <div className="mt-16 sm:mt-20 md:mt-24">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-8 p-3 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-8 border border-gray-100 transform transition-all hover:scale-[1.01]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 sm:mb-0">
                Profile Settings
              </h1>
              <FormProgress 
                progress={completion} 
                size={80} 
                className="hidden sm:flex" 
              />
              <FormProgress 
                progress={completion} 
                size={60} 
                className="sm:hidden self-start" 
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex space-x-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-grow sm:flex-grow-0 hover:bg-gray-100 transition-colors group"
                >
                  <X className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform" /> Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasUnsavedChanges || completion < 100}
                  className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all text-white disabled:opacity-50"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <section className="mb-8 sm:mb-12">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("basicInfo")}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Basic Information</h2>
              {expandedSections.basicInfo ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.basicInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-slide-down">
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>
                  <textarea
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                    rows={4}
                    value={profile.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about your journey, interests, and goals..."
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="h-4 w-4 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Experience Level</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {experienceLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => handleInputChange("experience", level)}
                        className={cn(
                          "py-2 rounded-lg transition-all text-sm flex items-center justify-center space-x-2 group",
                          profile.experience === level
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                        )}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                        {profile.experience === level && <Star className="h-3 w-3 animate-ping ml-2 bg-transparent" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Skills Section */}
          <section className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("skills")}>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                Skills
              </h2>
              {expandedSections.skills ? (
                <ChevronUp className="text-gray-500" />
              ) : (
                <ChevronDown className="text-gray-500" />
              )}
            </div>

            {expandedSections.skills && (
              <div className="space-y-4 animate-slide-down">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                  <input
                    type="text"
                    className="flex-grow rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 p-2"
                    placeholder="Enter a new skill (e.g., React, Python)"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <div className="flex space-x-2">
                    <select
                      className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={newSkill.category}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, category: e.target.value as SkillCategory }))}
                    >
                      {skillCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, level: e.target.value as SkillLevel }))}
                    >
                      {skillLevels.map((level) => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleAddSkill}
                      disabled={!newSkill.name}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all text-white disabled:opacity-50"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {profile.skills?.map((skill, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors group space-y-2 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3">
                        {skillCategories.find((cat) => cat.id === skill.category)?.icon}
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{skill.name}</span>
                          <span className="text-sm text-gray-500">{skill.category}</span>
                          {renderSkillLevelIndicator(skill.level)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSkill(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Academic Information */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Branch</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                  value={profile.branch || ""}
                  onChange={(e) => handleInputChange("branch", e.target.value)}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Year</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                  value={profile.year || ""}
                  onChange={(e) => handleInputChange("year", Number.parseInt(e.target.value))}
                  placeholder="Current year of study"
                />
              </div>
            </div>
          </section>

          {/* Resume Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Resume</h2>
            <div className="space-y-4">
              {profile.resume && (
                <div className="flex items-center space-x-4">
                  <File className="h-5 w-5 text-blue-500" />
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    View Current Resume
                  </a>
                  <Button variant="outline" size="sm" onClick={() => handleInputChange("resume", "")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("resume")?.click()}
                  disabled={uploadingResume}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingResume ? "Uploading..." : "Upload Resume"}
                </Button>
              </div>
            </div>
          </section>

          {/* Certificates Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Certificates</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                  placeholder="Certificate Name"
                  value={newCertificate.name}
                  onChange={(e) => setNewCertificate((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  type="text"
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                  placeholder="Issuer"
                  value={newCertificate.issuer}
                  onChange={(e) => setNewCertificate((prev) => ({ ...prev, issuer: e.target.value }))}
                />
                <input
                  type="date"
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                  value={newCertificate.dateIssued?.toISOString().split("T")[0]}
                  onChange={(e) => setNewCertificate((prev) => ({ ...prev, dateIssued: new Date(e.target.value) }))}
                />
              </div>
              <div>
                <input
                  type="file"
                  id="certificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleCertificateUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("certificate")?.click()}
                  disabled={uploadingCertificate || !newCertificate.name || !newCertificate.issuer}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingCertificate ? "Uploading..." : "Upload Certificate"}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {profile.certificates?.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <h3 className="font-medium">{cert.name}</h3>
                      <p className="text-sm text-gray-500">
                        {cert.issuer} - {new Date(cert.dateIssued).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {cert.certificateUrl && (
                        <a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          View
                        </a>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveCertificate(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Achievements Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Achievements</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Add an achievement (press Enter to add)"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyDown={handleAddAchievement}
                  className="flex-grow"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (newAchievement.trim()) {
                      setProfile((prev) => ({
                        ...prev,
                        achievements: [...(prev.achievements || []), newAchievement.trim()],
                      }))
                      setNewAchievement("")
                    }
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {profile.achievements?.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg group">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>{achievement}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAchievement(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">GitHub Profile</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={profile.githubUrl || ""}
                  onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={profile.linkedinUrl || ""}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">LeetCode Profile</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={profile.leetcodeUrl || ""}
                  onChange={(e) => {
                    const url = e.target.value
                    handleInputChange("leetcodeUrl", url)
                    handleInputChange("leetcodeUsername", extractLeetCodeUsername(url) || "")
                  }}
                  placeholder="https://leetcode.com/u/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Geeks For Geeks Profile</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={profile.gfgUrl || ""}
                  onChange={(e) => {
                    const url = e.target.value
                    handleInputChange("gfgUrl", url)
                    handleInputChange("gfgUsername", extractGFGUsername(url) || "")
                  }}
                  placeholder="https://geeksforgeeks.org/user/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Codechef Profile</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={profile.codechefUrl || ""}
                  onChange={(e) => {
                    const url = e.target.value
                    handleInputChange("codechefUrl", url)
                    handleInputChange("gfgUsername", extractGFGUsername(url) || "")
                  }}
                  placeholder="https://www.codechef.com/user/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">HackerRank Profile</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={profile.hackerrankUrl || ""}
                  onChange={(e) => {
                    const url = e.target.value
                    handleInputChange("hackerrankUrl", url)
                    handleInputChange("gfgUsername", extractGFGUsername(url) || "")
                  }}
                  placeholder="https://www.hackerrank.com/profile"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Portfolio Website</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={profile.portfolioUrl || ""}
                  onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </section>

          {/* Teams Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Your Teams</h2>
            {userTeams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No teams yet</h3>
                <p className="mt-1 text-sm text-gray-500">Join or create a team to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0"
                  >
                    <div>
                      <h3 className="font-medium">{team.name}</h3>
                      {team.description && <p className="text-sm text-gray-500">{team.description}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.createdBy === user?.uid ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.id)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Team
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaveTeam(team.id)}
                          className="w-full sm:w-auto"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Leave Team
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/team/${team.id}`)}
                        className="w-full sm:w-auto"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Open Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

