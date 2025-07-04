"use client"

import type React from "react"
import { act, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, MonthlyLeaderboard, MonthlyUserStats } from "@/types"
import { Users, Download, Code, Brain, Trophy, ArrowUp, ArrowDown, Star, ChevronRight, ChevronLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import * as cheerio from "cheerio"
import { useNavigate } from "react-router-dom"

const rankColors = {
  gold: {
    bg: "bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30",
    text: "text-amber-900",
    border: "border-amber-300",
    light: "bg-amber-100",
    icon: "text-amber-600",
  },
  silver: {
    bg: "bg-gradient-to-b from-gray-400/20 to-gray-500/10 border border-gray-400/30",
    text: "text-slate-900",
    border: "border-slate-300",
    light: "bg-slate-100",
    icon: "text-slate-600",
  },
  bronze: {
    bg: "bg-gradient-to-b from-orange-400/20 to-orange-500/10 border border-orange-400/30",
    text: "text-orange-900",
    border: "border-orange-300",
    light: "bg-orange-100",
    icon: "text-orange-600",
  },
  default: {
    bg: "bg-gradient-to-r from-primary/10 to-primary/5",
    text: "text-primary",
    border: "border-primary/20",
    light: "bg-primary/5",
    icon: "text-primary",
  },
 
}

const levelColors = {
  Master: {
    bg: "bg-purple-500",
    text: "text-purple-700",
    light: "bg-purple-100",
    border: "border-purple-200",
  },
  Expert: {
    bg: "bg-blue-500",
    text: "text-blue-700",
    light: "bg-blue-100",
    border: "border-blue-200",
  },
  Advanced: {
    bg: "bg-green-500",
    text: "text-green-700",
    light: "bg-green-100",
    border: "border-green-200",
  },
  Intermediate: {
    bg: "bg-yellow-500",
    text: "text-yellow-700",
    light: "bg-yellow-100",
    border: "border-yellow-200",
  },
  Beginner: {
    bg: "bg-gray-400",
    text: "text-gray-700",
    light: "bg-gray-100",
    border: "border-gray-200",
  },
}

const ADMIN_EMAILS = ["drsoourabhrungta@rungta.org"]
const UPDATE_INTERVAL = 1500 * 1000 

interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
}
interface GFGCodeStats {                             
  total_problems_solved: number
  total_score: number
  current_rating:number
  Basic:number
  Easy:number
  Medium: number
  Hard: number
}

interface GFGCodeStats {                             
  total_problems_solved: number
  total_score: number
  current_rating:number
  Basic:number
  Easy:number
  Medium: number
  Hard: number
}

interface codechefCodeStats {                             
  contestRating: number
  numberOfContestAttended:number
  problemsSolved:number
}



interface UserStats {
  lastUpdated: number
  leetcodeSolved: number
  leetcodeEasySolved: number
  leetcodeMediumSolved: number
  leetcodeHardSolved: number
  leetcodeAcceptanceRate: number
  leetcodeRanking: number
  leetcodeContributionPoints: number
  gfgSolved: number
  gfgScore: number
  gfgCurrentRating: number
  gfgBasic: number
  gfgEasy: number
  gfgMedium: number
  gfgHard: number
  githubRepos: number
  codechefRating: number
  codechefContestAttended: number
  codechefProblemsSolved: number
}



const Leaderboard: React.FC = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<MonthlyUserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const TOP_THREE_COUNT = 3

  const filteredUsers = useMemo(() => {
    let result = [...users]

    // Apply tab filter
    if (activeTab === "top10") {
      result = result.slice(0, 10)
    } else if (activeTab === "master") {
      result = result.filter((user) => user.problemSolvingLevel === "Master" || user.developerLevel === "Master")
    } else if (activeTab === "expert") {
      result = result.filter((user) => user.problemSolvingLevel === "Expert" || user.developerLevel === "Expert")
    }

    return result
  }, [users, activeTab])

  // Pagination logic
  const paginatedUsers = useMemo(() => {
    // Always show top 3
    const topThree = filteredUsers.slice(0, TOP_THREE_COUNT)
    
    // Paginate the rest
    const startIndex = TOP_THREE_COUNT + (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedList = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    
    return {
      topThree,
      paginatedList
    }
  }, [filteredUsers, currentPage])

  // Pagination calculations
  const totalPages = Math.ceil((filteredUsers.length - TOP_THREE_COUNT) / ITEMS_PER_PAGE)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const extractUsername = (url: string | undefined): string | null => {
    if (!url) return null
    try {
      const urlParts = new URL(url).pathname.split("/").filter(Boolean)
      return urlParts[urlParts.length - 1] || null
    } catch {
      return null
    }
  }

  const fetchLeetCodeStats = async (leetcodeUsername: string | null): Promise<LeetCodeStats | null> => {
    if (!leetcodeUsername) return null
  
    try {
      const response = await fetch(`${process.env.REACT_APP_LEECODE_URL}/${leetcodeUsername}`)
      if (!response.ok) throw new Error(`LeetCode API error: ${response.statusText}`)
  
      const data = await response.json()
      console.log(`Fetched LeetCode stats for ${leetcodeUsername}:`, data)
      
      // Return all the available data
      return {
        totalSolved: data.totalSolved ?? 0,
        easySolved: data.easySolved ?? 0,
        mediumSolved: data.mediumSolved ?? 0,
        hardSolved: data.hardSolved ?? 0,
        acceptanceRate: data.acceptanceRate ?? 0,
        ranking: data.ranking ?? 0,
        contributionPoints: data.contributionPoints ?? 0
      }
    } catch (error) {
      console.error(`Error fetching LeetCode stats for ${leetcodeUsername}:`, error)
      return null
    }
  }
  

  const fetchGFGStats = async (gfgUsername: string | null): Promise<GFGCodeStats | null> => {
    if (!gfgUsername) return null

    try {
      const response = await fetch(`${process.env.REACT_APP_GFG_URL}/${gfgUsername}?raw=true`)
      const data = await response.json()
      console.log(`Fetched GFG stats for ${gfgUsername}:`, data)
      return {
        total_problems_solved: data.total_problems_solved ?? 0,
        total_score: data.total_score ?? 0,
        current_rating: data.current_rating ?? 0,
        Basic: data.Basic ?? 0,
        Easy: data.Easy ?? 0,
        Medium: data.Medium ?? 0,
        Hard: data.Hard ?? 0
      }
    } catch (error) {
      console.error(`Error fetching GFG stats for ${gfgUsername}:`, error)
      return null
    }
  }

  const fetchGithubRepos = async (githubUsername: string | null): Promise<number | null> => {
    if (!githubUsername) return null

    try {
      const response = await fetch(`${process.env.REACT_APP_GITHUB_URL}/${githubUsername}`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`, 
          "User-Agent": "Crevo",
        },
      })
      const data = await response.json()
      console.log(`Fetched GitHub stats for ${githubUsername}:`, data)
      return data.public_repos ?? 0
    } catch (error) {
      console.error(`Error fetching GitHub stats for ${githubUsername}:`, error)
      return null
    }
  }

  const fetchhackerrankStats = async (hackerrankUsername: string | null) => {
    if (!hackerrankUsername) return null

    try {
      const response = await fetch(
        `${process.env.REACT_APP_HACKERRANK_URL}/${hackerrankUsername}`,
      )
      const html = await response.text()
      const $ = cheerio.load(html)

      const contestRating = $("._3ABBR").text().trim() || "N/A"
      console.log(`Fetched HackerRank contest rating for ${hackerrankUsername}: ${contestRating}`)

      return { username: hackerrankUsername, contestRating }
    } catch (error) {
      console.error(`Error fetching HackerRank contest rating for ${hackerrankUsername}:`, error)
      return { error: "Failed to fetch data. Check username or network." }
    }
  }

  const fetchCodechefStats = async (codechefUsername: string | null): Promise<codechefCodeStats | null> => {
    if (!codechefUsername) return null
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_CODECHEF_URL}/${codechefUsername}`
      )
      const html = await response.text()
      
      // Use DOMParser to parse the HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      // Extract data using DOM methods
      const ratingElement = doc.querySelector('.rating-number')
      const problemsSolvedElement = Array.from(doc.querySelectorAll('.problems-solved h3'))
        .find(el => el.textContent?.includes('Total Problems Solved'))
      const contestAttendedElement = doc.querySelector('.contest-participated-count')
      
      const result = {
        problemsSolved: problemsSolvedElement ? parseInt(problemsSolvedElement.textContent?.match(/\d+/)?.[0] || '0') : 0,
        contestRating: ratingElement ? parseInt(ratingElement.textContent?.match(/\d+/)?.[0] || '0') : 0,
        numberOfContestAttended: contestAttendedElement ? parseInt(contestAttendedElement.textContent?.match(/\d+/)?.[0] || '0') : 0
      }
      
      console.log(`Fetched CodeChef stats for ${codechefUsername}:`, result)
      return {
        contestRating: result.contestRating,
        numberOfContestAttended: result.numberOfContestAttended,
        problemsSolved: result.problemsSolved
      }
    } catch (error) {
      console.error(`Error fetching CodeChef stats for ${codechefUsername}:`, error)
      return null
    }
  }

  const getUserStats = async (user: User): Promise<UserStats> => {
    const statsRef = doc(db, "userStats", user.uid)
    const statsDoc = await getDoc(statsRef)
    const currentTime = Date.now()

    // Check if we have recent stats
    if (statsDoc.exists()) {
      const stats = statsDoc.data() as UserStats
      if (currentTime - stats.lastUpdated < UPDATE_INTERVAL) {
        console.log(`Using cached stats for user: ${user.displayName}`)
        return stats
      }
    }

    // Fetch fresh stats
    console.log(`Fetching fresh stats for user: ${user.displayName}`)
    const leetcodeUsername = extractUsername(user.leetcodeUrl)
    const gfgUsername = extractUsername(user.gfgUrl)
    const githubUsername = extractUsername(user.githubUrl)
    const hackerrankUsername = extractUsername(user.hackerrankUrl)
    const codechefUsername = extractUsername(user.codechefUrl)

    const [leetcodeData, gfgdata, githubRepos, codechefdata] = await Promise.all([
      fetchLeetCodeStats(leetcodeUsername),
      fetchGFGStats(gfgUsername),
      fetchGithubRepos(githubUsername),
      fetchCodechefStats(codechefUsername),
      fetchhackerrankStats(hackerrankUsername),
    ])

    const newStats: UserStats = {
      lastUpdated: currentTime,
      leetcodeSolved: leetcodeData?.totalSolved ?? 0,
      leetcodeEasySolved: leetcodeData?.easySolved ?? 0,
      leetcodeMediumSolved: leetcodeData?.mediumSolved ?? 0,
      leetcodeHardSolved: leetcodeData?.hardSolved ?? 0,
      leetcodeAcceptanceRate: leetcodeData?.acceptanceRate ?? 0,
      leetcodeRanking: leetcodeData?.ranking ?? 0,
      leetcodeContributionPoints: leetcodeData?.contributionPoints ?? 0,
      gfgSolved: gfgdata?.total_problems_solved ?? 0,
      gfgScore: gfgdata?.total_score ?? 0, 
      gfgCurrentRating: gfgdata?.current_rating ?? 0,
      gfgBasic: gfgdata?.Basic ?? 0,
      gfgEasy: gfgdata?.Easy ?? 0,
      gfgMedium: gfgdata?.Medium ?? 0,
      gfgHard: gfgdata?.Hard ?? 0,
      githubRepos: githubRepos ?? 0,
      codechefRating: codechefdata?.contestRating?? 0,
      codechefContestAttended: codechefdata?.numberOfContestAttended ?? 0,
      codechefProblemsSolved: codechefdata?.problemsSolved ?? 0,
      
    }

    // Save the new stats
    await setDoc(statsRef, newStats)
    console.log(`Updated stats for user: ${user.displayName}`, newStats)

    return newStats
  }

  const getProblemSolvingLevel = (totalSolved: number): string => {
    if (totalSolved >= 1400) return "Master"
    if (totalSolved >= 800) return "Expert"
    if (totalSolved >= 500) return "Advanced"
    if (totalSolved >= 150) return "Intermediate"
    return "Beginner"
  }

  const getDeveloperLevel = (repos: number): string => {
    if (repos >= 50) return "Master"
    if (repos >= 30) return "Expert"
    if (repos >= 18) return "Advanced"
    if (repos >= 15) return "Intermediate"
    return "Beginner"
  }

  const calculateRankScore = (
    leetcodeSolved: number = 0, 
  gfgSolved: number = 0, 
  githubRepos: number = 0, 
  codechefProblemsSolved: number = 0
  ): number => {
    return Math.min(
      leetcodeSolved * 0.15 +  // Increased weightage for coding
      gfgSolved * 0.15 + 
      codechefProblemsSolved * 0.15 + 
      githubRepos * 0.05, // Lower weightage for repositories
      100
    );
  }
  
  
  

  const saveMonthlyLeaderboard = async (leaderboard: MonthlyLeaderboard) => {
    const leaderboardRef = doc(db, "monthlyLeaderboards", `${leaderboard.year}-${leaderboard.month}`)
    await setDoc(leaderboardRef, leaderboard)
    console.log(`Saved leaderboard for ${leaderboard.year}-${leaderboard.month}`)
  }

  const getMonthlyLeaderboard = async (month: number, year: number): Promise<MonthlyLeaderboard | null> => {
    const leaderboardRef = doc(db, "monthlyLeaderboards", `${year}-${month}`)
    const leaderboardDoc = await getDoc(leaderboardRef)
    return leaderboardDoc.exists() ? (leaderboardDoc.data() as MonthlyLeaderboard) : null
  }

  const updateMonthlyLeaderboard = async () => {
    console.log("Starting monthly leaderboard update")
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    // Always fetch fresh data for the current month
    const usersRef = collection(db, "users")
    const userSnapshot = await getDocs(usersRef)
    const userList = userSnapshot.docs
      .map((doc) => {
        const data = doc.data() as Omit<User, "uid">
        return { uid: doc.id, ...data } as User
      })
      .filter((user) => !ADMIN_EMAILS.includes(user.email))

    console.log(`Processing ${userList.length} users for leaderboard update`)

    const updatedUsers = await Promise.all(
      userList.map(async (user) => {
        const stats = await getUserStats(user)
        const totalSolved = stats.leetcodeSolved + stats.gfgSolved + stats.codechefProblemsSolved

        return {
          ...user,
          totalSolved,
          problemSolvingLevel: getProblemSolvingLevel(totalSolved),
          developerLevel: getDeveloperLevel(stats.githubRepos),
          total_solved_questions: stats.leetcodeSolved,
          total_problems_solved: stats.gfgSolved,
          public_repos: stats.githubRepos,
          currentRating: stats.codechefRating,
          rankScore: calculateRankScore(stats.leetcodeSolved, stats.gfgSolved, stats.githubRepos),
        leetcodeEasySolved: stats.leetcodeEasySolved,
        leetcodeMediumSolved: stats.leetcodeMediumSolved,
        leetcodeHardSolved: stats.leetcodeHardSolved,
        leetcodeAcceptanceRate: stats.leetcodeAcceptanceRate,
        leetcodeRanking: stats.leetcodeRanking,
        leetcodeContributionPoints: stats.leetcodeContributionPoints,
        gfgScore: stats.gfgScore,
        gfgCurrentRating: stats.gfgCurrentRating,
        gfgBasic: stats.gfgBasic,
        gfgEasy: stats.gfgEasy,
        gfgMedium: stats.gfgMedium,
        gfgHard: stats.gfgHard,
        codechefContestAttended: stats.codechefContestAttended,
        codechefProblemsSolved: stats.codechefProblemsSolved,


        }
      }),
    )

    const previousLeaderboard = await getMonthlyLeaderboard(month, year)
    const previousPositions =
      previousLeaderboard?.users.reduce(
        (acc, user) => ({
          ...acc,
          [user.uid]: user.position,
        }),
        {} as Record<string, number>,
      ) ?? {}

    const sortedUsers = updatedUsers
      .sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0))
      .map((user, index) => ({
        ...user,
        position: index + 1,
        previousPosition: previousPositions[user.uid] ?? null,
      }))

    const newLeaderboard: MonthlyLeaderboard = {
      month,
      year,
      users: sortedUsers,
    }

    await saveMonthlyLeaderboard(newLeaderboard)

    // Only update the UI if we're viewing the current month
    if (month === currentMonth && year === currentYear) {
      setUsers(sortedUsers)
    }
    setLastUpdated(new Date())

    console.log("Monthly leaderboard update completed")
  }

  const fetchMonthlyLeaderboard = async (month: number, year: number) => {
    console.log(`Fetching leaderboard for ${year}-${month}`)
    setLoading(true)
    try {
      const leaderboard = await getMonthlyLeaderboard(month, year)
      if (leaderboard) {
        setUsers(leaderboard.users)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching monthly leaderboard:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchAndSetup = async () => {
      setLoading(true)
      try {
        // Fetch available months
        const leaderboardsRef = collection(db, "monthlyLeaderboards")
        const leaderboardsSnapshot = await getDocs(leaderboardsRef)
        const months = leaderboardsSnapshot.docs.map((doc) => {
          const [year, month] = doc.id.split("-").map(Number)
          return { month, year }
        })
        setAvailableMonths(months.sort((a, b) => b.year - a.year || b.month - a.month))

        // Initial update
        await updateMonthlyLeaderboard()
      } catch (error) {
        console.error("Error in initial setup:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAndSetup()

    // Set up periodic updates
    const updateInterval = setInterval(() => {
      console.log("Triggering periodic update...")
      updateMonthlyLeaderboard()
    }, UPDATE_INTERVAL)

    // Cleanup interval on component unmount
    return () => clearInterval(updateInterval)
  }, []) 

  useEffect(() => {
    fetchMonthlyLeaderboard(currentMonth, currentYear)
  }, [currentMonth, currentYear])

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split("-").map(Number)
    setCurrentMonth(month)
    setCurrentYear(year)
  }

  const exportToCSV = () => {
    const headers = [
      "Rank",
      "Name",
      "Year",
      "Branch",
      "ERP ID",
      "Developer Level",
      "Problem Solving",
      "Github Repo",
      "GFG Solved Question",
      "LeetCode Solved Question",
      "Codechef Questions",
      "Score",
    ]
    const csvContent = [
      headers.join(","),
      ...users.map((user, index) =>
        [
          index + 1,
          user.displayName,
          user.year,
          user.branch,
          user.email.split("@")[0],
          user.developerLevel,
          user.problemSolvingLevel,
          user.public_repos,
          user.total_problems_solved,
          user.total_solved_questions,
          user.codechefProblemsSolved,
          user.rankScore?.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "leaderboard.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getRankColor = (position: number) => {
    if (position === 1) return rankColors.gold
    if (position === 2) return rankColors.silver
    if (position === 3) return rankColors.bronze
    return rankColors.default
  }


return (
  <div className="container px-4 py-10 mx-auto bg-gradient-to-b from-background to-background/50 mt-[4rem] md:mt-[2.5rem]">
    <div className="flex flex-col space-y-6">
      <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-border/50 shadow-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col w-full md:w-auto">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl text-black font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-heading tracking-tight">
                Leaderboard
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 w-full text-sm md:text-base">
              Track your progress, compete with peers, and showcase your coding skills across multiple platforms.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-between w-full md:w-auto">
            <Select onValueChange={handleMonthChange} defaultValue={`${currentYear}-${currentMonth}`}>
              <SelectTrigger className="w-full md:w-[180px] bg-white ">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableMonths.map(({ month, year }) => (
                  <SelectItem key={`${year}-${month}`} value={`${year}-${month}`}>
                    {new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Card className="bg-primary/10 hover:bg-primary/20 transition-colors border-primary/20 w-full md:w-auto">
                <CardContent className="flex items-center p-3">
                  <Users className="mr-2 text-primary" size={18} />
                  <span className="font-medium text-primary">{users.length} Participants</span>
                </CardContent>
              </Card>

              {isAdmin && (
                <Card
                  className="bg-green-500/10 hover:bg-green-500/20 cursor-pointer transition-colors border-green-500/20 w-full md:w-auto"
                  onClick={exportToCSV}
                >
                  <CardContent className="flex items-center p-3">
                    <Download className="mr-2 text-green-600" size={18} />
                    <span className="font-medium text-green-700">Export CSV</span>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {lastUpdated && (
          <div className="text-xs md:text-sm text-muted-foreground text-right mt-2">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}

<Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="bg-background/80 backdrop-blur-sm border border-border/50 mb-4 sm:w-[50%] flex-wrap">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-primary/10">
              All Users
            </TabsTrigger>
            <TabsTrigger value="top10" className="flex-1 data-[state=active]:bg-primary/10">
              Top 10
            </TabsTrigger>
            <TabsTrigger value="master" className="flex-1 data-[state=active]:bg-primary/10">
              Masters
            </TabsTrigger>
            <TabsTrigger value="expert" className="flex-1 data-[state=active]:bg-primary/10">
              Experts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderLeaderboardContent()}
          </TabsContent>

          <TabsContent value="top10" className="mt-0">
            {renderLeaderboardContent()}
          </TabsContent>

          <TabsContent value="master" className="mt-0">
            {renderLeaderboardContent()}
          </TabsContent>

          <TabsContent value="expert" className="mt-0">
            {renderLeaderboardContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
)

function renderLeaderboardContent() {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading leaderboard data...</p>
        </div>
      </div>
    )
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold">No results found</h3>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden"
    >
      {(activeTab === "all" || activeTab === "top10" || activeTab === "master" || activeTab === "expert") && paginatedUsers.topThree.length > 0 && (
        <>
          <div className="block md:hidden overflow-x-auto pb-4">
            <div className="flex space-x-4 px-4">
              {paginatedUsers.topThree.map((user, idx) => {
                const rankColor =
                  idx === 0
                    ? rankColors.gold
                    : idx === 1
                      ? rankColors.silver
                      : rankColors.bronze

                return (
                  <motion.div
                    key={user.uid}
                    className={`flex-shrink-0 w-64 rounded-lg p-5 cursor-pointer transition-all duration-300 
                      bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-sm border ${rankColor.border}`}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    onClick={() => navigate(`/profile/${user.erpId}`)}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${rankColor.light} ${rankColor.text}`}
                      >
                        {user.displayName?.charAt(0) || "?"}
                      </div>
                      <h3 className="font-bold text-center mt-2">{user.displayName}</h3>
                      <div className="text-sm text-muted-foreground">
                        {user.year} • {user.branch}
                      </div>
                      <div className="flex items-center mt-1 gap-2">
                        <Trophy className={rankColor.icon} size={16} />
                        <span className="font-semibold">{user.rankScore?.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 hidden md:block">
            <h2 className="text-xl font-bold mb-4 text-foreground/80 flex items-center">
              <Star className="mr-2 h-5 w-5 text-primary" />
              Top Performers
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {paginatedUsers.topThree.map((user, idx) => {
                const rankColor =
                  idx === 0
                    ? rankColors.gold
                    : idx === 1
                      ? rankColors.silver
                      : idx === 2
                        ? rankColors.bronze
                        : rankColors.default

                return (
                  <motion.div
                    key={user.uid}
                    className={`relative rounded-lg p-5 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 
                      bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-sm border ${rankColor.border}`}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    onClick={() => navigate(`/profile/${user.erpId}`)}
                  >
                    <div
                      className={`absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full -mt-3 -mr-3 ${rankColor.bg} ${rankColor.text} font-bold`}
                    >
                      {idx + 1}
                    </div>
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${rankColor.light} ${rankColor.text}`}
                    >
                      {user.displayName?.charAt(0) || "?"}
                    </div>
                    <h3 className="font-bold text-center mt-2">{user.displayName}</h3>
                    <div className="text-sm text-muted-foreground">
                      {user.year} • {user.branch}
                    </div>
                    <div className="flex items-center mt-1 gap-2">
                      <Trophy className={rankColor.icon} size={16} />
                      <span className="font-semibold">{user.rankScore?.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full mt-2 text-sm">
                      <div className="flex flex-col items-center p-1 bg-background/50 rounded">
                        <p className="text-xs font-sans">Github</p>
                        <span>{user.public_repos}</span>
                      </div>
                      <div className="flex flex-col items-center p-1 bg-background/50 rounded">
                        <p className="text-xs font-sans">GFG</p>
                        <span>{user.total_problems_solved}</span>
                      </div>
                      <div className="flex flex-col items-center p-1 bg-background/50 rounded gap-2">
                        <p className="text-xs font-sans">Leetcode</p>
                        <span>{user.total_solved_questions}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
          </>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary/5 text-foreground/70">
                {[
                  "Rank",
                  "Name",
                  "Year",
                  "Dev Level",
                  "Problem Solving",
                  "Github",
                  "Codechef",
                  "GFG",
                  "Leetcode",
                  "Score",
                ].map((header) => (
                  <th key={header} className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <AnimatePresence>
                {paginatedUsers.paginatedList.map((user, index) => {
                  const actualRank = TOP_THREE_COUNT + (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                  const rankColor = getRankColor(actualRank)

                  return (
                    <motion.tr
                      key={user.uid}
                      onClick={() => navigate(`/profile/${user.erpId}`)}
                      className={`
                        ${actualRank <= 3 ? "bg-gradient-to-r from-primary/5 to-transparent" : "hover:bg-primary/5"}
                        transition-colors cursor-pointer
                      `}
                      whileHover={{ backgroundColor: "rgba(var(--primary), 0.1)" }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-1.5">
                          {user.previousPosition !== null && (
                            <div className="w-5">
                              {actualRank < user.previousPosition ? (
                                <div className="flex items-center text-green-500">
                                  <ArrowUp size={14} />
                                  <span className="text-xs">{user.previousPosition - actualRank}</span>
                                </div>
                              ) : actualRank > user.previousPosition ? (
                                <div className="flex items-center text-red-500">
                                  <ArrowDown size={14} />
                                  <span className="text-xs">{actualRank - user.previousPosition}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </div>
                          )}
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-full ${rankColor.light} ${rankColor.text}`}
                          >
                            {actualRank}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-xs text-muted-foreground">{user.branch}</div>
                      </td>
                      <td className="p-4">{user.year}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${levelColors[user.developerLevel]?.bg || "bg-gray-500"}`}
                          ></div>
                          <span>{user.developerLevel}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${levelColors[user.problemSolvingLevel]?.bg || "bg-gray-500"}`}
                          ></div>
                          <span>{user.problemSolvingLevel}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Code className="text-primary" size={16} />
                          <span>{user.public_repos}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono">{user.codechefProblemsSolved || "-"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Brain className="text-green-600" size={16} />
                          <span>{user.total_problems_solved}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Brain className="text-orange-500" size={16} />
                          <span>{user.total_solved_questions}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Trophy className={rankColor.icon} size={16} />
                          <span>{user.rankScore?.toFixed(2)}</span>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
          {totalPages > 0 && (
          <div className="flex justify-center text-black items-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full text-black hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-8 h-8 rounded-full ${
                    currentPage === index + 1 
                      ? 'bg-primary text-black' 
                      : 'hover:bg-primary/10 text-foreground'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </motion.div>
    )
  }
}

export default Leaderboard
