"use client"

import { useState, useEffect } from "react"
import { Search, X, Calendar, Users, Trophy, Loader, User, Tag, Globe, Clock } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Hackathon } from "@/types"
import { HackathonFilters } from "@/components/hackathon-filters"
import { Separator } from "@radix-ui/react-dropdown-menu"


interface UnstopHackathon {
  id: number
  title: string
  logoUrl2: string
  organisation: {
    name: string
  }
  regnRequirements: {
    remain_days: string
  }
  region: string
  prizes: Array<{
    cash: number
  }>
  registerCount: number
  start_date: string
  end_date: string
  filters: Array<{
    name: string
  }>
  status: string
  seo_url: string
}

export default function HackathonList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  // console.log(currentPage)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [unstopHackathons, setUnstopHackathons] = useState<Hackathon[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([])
  const [sortBy, setSortBy] = useState<"relevant" | "date" | "recent" | "prize">("prize")
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const hackathonsPerPage = 15
  const [filters, setFilters] = useState({
    managedByDevpost: false,
    location: {
      online: false,
      inPerson: false,
    },
    status: {
      upcoming: false,
      open: false,
      ended: false,
    },
    length: {
      shortTerm: false,
      longTerm: false,
    },
  })

  // Transform Unstop data to match your Hackathon type
  const transformUnstopData = (data: UnstopHackathon): Hackathon => ({
    id: data.id.toString(),
    title: data.title,
    image: data.logoUrl2,
    organizer: data.organisation?.name || "",
    timeLeft: data.regnRequirements?.remain_days || "",
    isOnline: data.region === "online",
    prizeAmount: data.prizes?.[0]?.cash || 0,
    participants: data.registerCount || 0,
    startDate: data.start_date,
    endDate: data.end_date,
    tags: data.filters?.map(f => f.name) || [],
    status: data.status.toLowerCase(),
    RegisterLink: data.seo_url,
    description: "", // Add defaults for required fields
    requirements: [],
    rules: [],
    timeline: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })



  useEffect(() => {
    async function fetchAllHackathons() {
      setLoading(true)
      try {
        const hackathonsRef = collection(db, "hackathons")
        const q = query(hackathonsRef, orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const firebaseHackathons = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Hackathon))

        const unstopResponse = await fetch(`https://proxy-server-for-unstop.onrender.com/api/hackathons?per_page=${hackathonsPerPage}&page=${currentPage}`);

        // console.log(`https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=${hackathonsPerPage}&oppstatus=open&quickApply=true&page=${currentPage}`)
        const unstopData = await unstopResponse.json()
        // console.log(unstopData)
        const transformedUnstopHackathons = unstopData.data.data.map(transformUnstopData)

        setHackathons(firebaseHackathons)
        setUnstopHackathons(transformedUnstopHackathons)
        setTotalPages(Math.ceil(unstopData.data.total / hackathonsPerPage))
      } catch (error) {
        console.error("Error fetching hackathons:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllHackathons()
  }, [currentPage])

  // Combined filtering logic for both sources
  useEffect(() => {
    const allHackathons = [...hackathons, ...unstopHackathons]
    const filtered = allHackathons.filter((hackathon) => {
      const matchesSearch =
        hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLocation =
        (!filters.location.online && !filters.location.inPerson) ||
        (filters.location.online && hackathon.isOnline) ||
        (filters.location.inPerson && !hackathon.isOnline)

      const matchesStatus =
        (!filters.status.upcoming && !filters.status.open && !filters.status.ended) ||
        (filters.status.upcoming && hackathon.status === "upcoming") ||
        (filters.status.open && hackathon.status === "open") ||
        (filters.status.ended && hackathon.status === "ended")

      const matchesLength = !filters.length.shortTerm && !filters.length.longTerm

      return matchesSearch && matchesLocation && matchesStatus && matchesLength
    })

    const sorted = [...filtered]
    switch (sortBy) {
      case "date":
        sorted.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        break
      case "recent":
        sorted.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt
          return dateB.getTime() - dateA.getTime()
        })
        break
      case "prize":
        sorted.sort((a, b) => b.prizeAmount - a.prizeAmount)
        break
    }

    setFilteredHackathons(sorted)
  }, [searchTerm, sortBy, filters, hackathons, unstopHackathons])

  // console.log(hackathons)

  function formatDate(timestamp: Timestamp | { seconds: number; nanoseconds: number }) {
    const firestoreTimestamp =
      timestamp instanceof Timestamp ? timestamp : new Timestamp(timestamp.seconds, timestamp.nanoseconds)

    const date = firestoreTimestamp.toDate()
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`
    }

    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // const currentHackathons = filteredHackathons.slice(
  //   (currentPage - 1) * hackathonsPerPage,
  //   currentPage * hackathonsPerPage,
  // )

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    setFilters((prev) => {
      if (filterType === "managedByDevpost") {
        return { ...prev, managedByDevpost: checked }
      }
      return {
        ...prev,
        [filterType]: {
          ...(prev[filterType as keyof typeof prev] as object),
          [value]: checked,
        },
      }
    })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Made more responsive with additional breakpoints */}
      <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 pt-12 sm:pt-16 md:pt-20 pb-5 px-4 flex justify-center items-center">
  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 max-w-full mx-auto text-center">
    Join the world's best online and in-person Competitions
  </h1>
</div>


<div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 bg-gray-50">
  {/* Search Section */}
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500" />
      <Input
        type="text"
        placeholder="Search by title or keyword"
        className="pl-10 w-full border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
      {searchTerm && (
        <Button 
          variant="outline" 
          onClick={() => setSearchTerm("")} 
          className="bg-red-50 text-red-600 hover:bg-red-100 w-full sm:w-auto"
        >
          Clear <X className="ml-2 h-4 w-4" />
        </Button>
      )}
      <Button 
        variant="outline" 
        className="bg-green-500 text-white hover:bg-green-600 w-full sm:w-auto"
      >
        Match my eligibility
      </Button>
    </div>
  </div>

  {/* Layout */}
  <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
    {/* Sidebar */}
    <div className="w-full lg:w-64 shrink-0">
      <HackathonFilters filters={filters} onFilterChange={handleFilterChange} />
    </div>

    {/* Main Content */}
    <div className="flex-1">
      {/* Sorting */}
      <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2 -mx-2 px-2">
        {["prize", "relevant", "date", "recent"].map((type) => (
          <Button
            key={type}
            variant={sortBy === type ? "primary" : "outline"}
            onClick={() => setSortBy(type)}
            className={`
              whitespace-nowrap transition-colors duration-300
              ${sortBy === type 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      <div className="text-sm text-gray-600 mb-4">Showing {filteredHackathons.length} hackathons</div>

      {/* Hackathon Cards */}
      <div className="grid gap-4 sm:gap-6">
        {filteredHackathons.map((hackathon) => (
          <div
            key={hackathon.id}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => setSelectedHackathon(hackathon)}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <img
                src={hackathon.image || "No image found"}
                alt={hackathon.title}
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
              />

              <div className="flex-1 w-full">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-indigo-800">
                  {hackathon.title}
                </h2>
                <Badge variant="secondary" className="mb-2 bg-yellow-100 text-yellow-800">
                  {hackathon.timeLeft}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {hackathon.status}
                </Badge>

                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-gray-600 mt-4 text-sm sm:text-base">
                  <div className="flex items-center gap-2 text-green-600">
                    <Trophy className="h-4 w-4" />
                    {hackathon.prizeAmount}
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Users className="h-4 w-4" />
                    {hackathon.participants}
                  </div>
                  <div className="flex items-center gap-2 text-purple-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                  {hackathon?.tags?.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-purple-100 text-purple-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-1 sm:gap-2 mt-8">
        <Button 
          variant="outline" 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(p => p - 1)}
          className="bg-gray-100 hover:bg-gray-200"
        >
          Prev
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
          <Button 
            key={i + 1} 
            variant={currentPage === i + 1 ? "primary" : "outline"}
            onClick={() => setCurrentPage(i + 1)}
            className={`
              ${currentPage === i + 1 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {i + 1}
          </Button>
        ))}
        <Button 
          variant="outline" 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(p => p + 1)}
          className="bg-gray-100 hover:bg-gray-200"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</div>

      {/* Dialog - Made more responsive */}

      <Dialog open={selectedHackathon !== null} onOpenChange={(open) => !open && setSelectedHackathon(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto bg-white border-none m-4 sm:m-0 p-6">
          {
            selectedHackathon && (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold">{selectedHackathon.title}</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedHackathon(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <img
                    src={selectedHackathon.image || "/placeholder.svg"}
                    alt={selectedHackathon.title}
                    className="w-full h-48 sm:h-64 object-contain rounded-lg shadow-md"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      {
                        icon: Trophy,
                        label: "Prizepool",
                        value: selectedHackathon.prizeAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" }),
                      },
                      { icon: Users, label: "Participants", value: selectedHackathon.participants },
                      { icon: Clock, label: "Time Left", value: selectedHackathon.timeLeft },
                      { icon: Globe, label: "Mode", value: selectedHackathon.isOnline ? "Online" : "Offline" },
                      { icon: User, label: "Organizer", value: selectedHackathon.organizer },
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <item.icon className="h-6 w-6 mb-2 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">{item.label}</span>
                        <span className="text-base font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHackathon.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Status</h3>
                    <p className="text-gray-700">{selectedHackathon.status}</p>
                  </div>

                  {selectedHackathon.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-gray-700">{selectedHackathon.description}</p>
                    </div>
                  )}

                  {selectedHackathon.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        {selectedHackathon.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedHackathon.rules && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Rules</h3>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        {selectedHackathon.rules.map((rule, i) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedHackathon.timeline && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Timeline</h3>
                      <div className="space-y-2">
                        {selectedHackathon.timeline.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="font-medium">{item.phase}</span>
                            <span className="text-gray-600">{item.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Registration</h3>
                    {selectedHackathon.RegisterLink ? (
                      <Button
                        onClick={() => window.open(selectedHackathon.RegisterLink, "_blank", "noopener,noreferrer")}
                        className="w-full sm:w-auto"
                      >
                        Register Now
                      </Button>
                    ) : (
                      <span className="text-gray-600">No registration link available</span>
                    )}
                  </div>
                </div>
              </>
            )
          }
        </DialogContent>
      </Dialog>

    </div>
  );
}

