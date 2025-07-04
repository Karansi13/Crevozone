import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/Button"
import { PlusCircle, Trash2, X, Check } from "lucide-react"
import toast from "react-hot-toast"
import type { Hackathon } from "../types/index"

export default function PublishHackathon() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<Partial<Hackathon>>({})

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const hackathonRef = doc(collection(db, "hackathons"))
      // console.log(hackathonRef)
      await setDoc(hackathonRef, {
        ...hackathon,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      })
      toast.success("Hackathon published successfully")
      navigate("/hackathons")
    } catch (error) {
      console.error("Error publishing hackathon:", error)
      toast.error("Failed to publish hackathon")
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = (tag: string) => {
    if (tag && !hackathon.tags?.includes(tag)) {
      setHackathon((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }))
    }
  }

  const handleRemoveTag = (tag: string) => {
    setHackathon((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }))
  }

  const handleAddRequirement = (requirement: string) => {
    if (requirement) {
      setHackathon((prev) => ({
        ...prev,
        requirements: [...(prev.requirements || []), requirement],
      }))
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setHackathon((prev) => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index),
    }))
  }

  const handleAddRule = (rule: string) => {
    if (rule) {
      setHackathon((prev) => ({
        ...prev,
        rules: [...(prev.rules || []), rule],
      }))
    }
  }

  const handleRemoveRule = (index: number) => {
    setHackathon((prev) => ({
      ...prev,
      rules: prev.rules?.filter((_, i) => i !== index),
    }))
  }

  const handleAddTimelinePhase = (phase: string, date: string) => {
    if (phase && date) {
      setHackathon((prev) => ({
        ...prev,
        timeline: [...(prev.timeline || []), { phase, date }],
      }))
    }
  }

  const handleRemoveTimelinePhase = (index: number) => {
    setHackathon((prev) => ({
      ...prev,
      timeline: prev.timeline?.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-24">
      <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 transform transition-all hover:scale-[1.01]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 sm:mb-0">
              Publish Competition
            </h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100 transition-colors group"
              >
                <X className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform" /> Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all text-white"
              >
                {saving ? (
                  "Publishing..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Publish Competition
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  required
                  value={hackathon.title}
                  onChange={(e) => setHackathon((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter Competition title"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Organizer</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  required
                  value={hackathon.organizer}
                  onChange={(e) => setHackathon((prev) => ({ ...prev, organizer: e.target.value }))}
                  placeholder="Enter organizer name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Image URL</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  required
                  value={hackathon.image}
                  onChange={(e) => setHackathon((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Prize Amount</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  required
                  value={hackathon.prizeAmount}
                  onChange={(e) => setHackathon((prev) => ({ ...prev, prizeAmount: Number(e.target.value) }))}
                  placeholder="Enter prize amount"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Start Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  required
                  value={hackathon.startDate}
                  onChange={(e) => setHackathon((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">End Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  required
                  value={hackathon.endDate}
                  onChange={(e) => setHackathon((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Is Online</label>
                <select
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  value={hackathon.isOnline ? "true" : "false"}
                  required
                  onChange={(e) => setHackathon((prev) => ({ ...prev, isOnline: e.target.value === "true" }))}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <select
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  required
                  value={hackathon.status}
                  onChange={(e) => setHackathon((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Description</h2>
            <textarea
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
              rows={6}
              value={hackathon.description}
              onChange={(e) => setHackathon((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter Competition description"
              required
            />
          </section>

          {/* Tags */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {hackathon.tags?.map((tag, index) => (
                <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-blue-800 hover:text-blue-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                required
                placeholder="Press Enter to add a new tag..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag((e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ""
                  }
                }}
              />
            </div>
          </section>

          {/* Requirements */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Requirements</h2>
            <div className="space-y-2 mb-4">
              {hackathon.requirements?.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <span>{requirement}</span>
                  <button onClick={() => handleRemoveRequirement(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                required
                placeholder="Press Enter to add Requirements..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddRequirement((e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ""
                  }
                }}
              />
            </div>
          </section>

          {/* Rules */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Rules</h2>
            <div className="space-y-2 mb-4">
              {hackathon.rules?.map((rule, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <span>{rule}</span>
                  <button onClick={() => handleRemoveRule(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                placeholder="Press Enter to add a new Rule..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddRule((e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ""
                  }
                }}
              />
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Timeline</h2>
            <div className="space-y-2 mb-4">
              {hackathon.timeline?.map((phase, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <span>
                    {phase.phase} - {phase.date}
                  </span>
                  <button onClick={() => handleRemoveTimelinePhase(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                placeholder="Phase name"
                id="phaseName"
                required
              />
              <input
                type="date"
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                id="phaseDate"
                required
              />
              <Button
                className="sm:col-span-2"
                onClick={() => {
                  const phaseName = (document.getElementById("phaseName") as HTMLInputElement).value
                  const phaseDate = (document.getElementById("phaseDate") as HTMLInputElement).value
                  if (phaseName && phaseDate) {
                    handleAddTimelinePhase(phaseName, phaseDate)
                    ;(document.getElementById("phaseName") as HTMLInputElement).value = ""
                    ;(document.getElementById("phaseDate") as HTMLInputElement).value = ""
                  }
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Phase
              </Button>
            </div>
          </section>
          <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Registration Link</h2>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-2"
                  required
                  value={hackathon.RegisterLink}
                  onChange={(e) => setHackathon((prev) => ({ ...prev, RegisterLink: e.target.value }))}
                  placeholder="Enter Registration Link"
                />
              </div>
        </div>
      </div>
    </div>
  )
}

