"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, UserStats } from "@/types"
import { BarChart,PieChart, Pie, Cell,LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Download, Code, Brain, Trophy, Award, Activity, Globe, Github, Mail, Calendar, Linkedin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiLinkedin, SiCodechef, SiLeetcode, SiGeeksforgeeks } from 'react-icons/si';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/AuthContext"
import * as cheerio from "cheerio"

const UPDATE_INTERVAL = 3 * 60 * 60 * 1000 // 3 hours

const Dashboard: React.FC = () => {
  const [contests, setContests] = useState([]);
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [updating, setUpdating] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("All");


  const platforms = ["All", ...new Set(contests.map((contest) => contest.platform))];

  

// Filter contests based on selected platform
const filteredContests = selectedPlatform === "All" 
  ? contests 
  : contests.filter((contest) => contest.platform === selectedPlatform);

  const extractUsername = (url: string | undefined): string | null => {
    if (!url) return null
    try {
      const urlParts = new URL(url).pathname.split("/").filter(Boolean)
      return urlParts[urlParts.length - 1] || null
    } catch {
      return null
    }
  }

  const fetchUserStats = async (user: User): Promise<UserStats> => {
    const statsRef = doc(db, "userStats", user.uid);
    const statsDoc = await getDoc(statsRef);
    const currentTime = Date.now();
  
    if (statsDoc.exists()) {
      const stats = statsDoc.data() as UserStats;
      if (currentTime - stats.lastUpdated < UPDATE_INTERVAL) {
        console.log(`Using cached stats for user: ${user.displayName}`);
        return stats;
      }
    }
  
    console.log(`Fetching fresh stats for user: ${user.displayName}`);
    const leetcodeUsername = extractUsername(user.leetcodeUrl);
    const gfgUsername = extractUsername(user.gfgUrl);
    const githubUsername = extractUsername(user.githubUrl);
    const hackerrankUsername = extractUsername(user.hackerrankUrl);
    const codechefUsername = extractUsername(user.codechefUrl);
  
    const [leetcodeSolved, gfgSolved, githubRepos, codechefRating, hackerrankStats] = await Promise.all([
      fetchLeetCodeStats(leetcodeUsername),
      fetchGFGStats(gfgUsername),
      fetchGithubRepos(githubUsername),
      fetchCodechefStats(codechefUsername),
      fetchhackerrankStats(hackerrankUsername),
    ]);
  
    const newStats: UserStats = {
      lastUpdated: currentTime,
      leetcodeSolved: leetcodeSolved ?? 0,
      gfgSolved: gfgSolved ?? 0,
      githubRepos: githubRepos ?? 0,
      codechefRating: codechefRating ?? 0,
      hackerrankStats: hackerrankStats ?? { username: "", contestRating: "N/A" },
    };
  
    await setDoc(statsRef, newStats);
    console.log(`Updated stats for user: ${user.displayName}`, newStats);
  
    return newStats;
  };

  const updateStats = async () => {
    if (!user?.uid || !profile) return
    setUpdating(true)

    try {
      const newStats = await fetchUserStats(profile)
      await setDoc(doc(db, "userStats", user.uid), newStats)
      setStats(newStats)
    } catch (error) {
      console.error("Error updating stats:", error)
      setError("Failed to update statistics")
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetch("https://node.codolio.com/api/contest-calendar/v1/all/get-contests")
      .then((res) => res.json())
      .then((data) => {
        const sortedContests = data.data.sort((a, b) => {
          const dateA = new Date(a.contestStartDate.split("/").reverse().join("-")); // Converts "MM/DD/YYYY" to "YYYY-MM-DD"
          const dateB = new Date(b.contestStartDate.split("/").reverse().join("-"));
          return dateA - dateB; // Sort in ascending order (earliest first)
        });
  
        setContests(sortedContests);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contests:", err);
        setLoading(false);
      });
  }, []);
  
  
  

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        
        const profileDoc = await getDoc(doc(db, "users", user.uid))
        if (!profileDoc.exists()) {
          setError("User profile not found")
          return
        }
        
        const profileData = profileDoc.data() as User
        setProfile(profileData)

        const statsDoc = await getDoc(doc(db, "userStats", user.uid))
        if (statsDoc.exists()) {
          const statsData = statsDoc.data() as UserStats
          
          if (Date.now() - statsData.lastUpdated > UPDATE_INTERVAL) {
            await updateStats()
          } else {
            setStats(statsData)
          }
        } else {
          await updateStats()
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user?.uid])




  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!profile || !stats) {
    return (
      <Alert>
        <AlertDescription>No data available. Please check your profile settings.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Left Side (Profile and Stats) */}
          <div className="md:col-span-3 space-y-6">
            {/* Profile Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Profile Card */}
              <Card className="md:col-span-1 overflow-hidden border-0 shadow-lg">
                             <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-16"></div>
                             <CardContent className="p-6 text-center -mt-8">
                               <div className="relative inline-block">
                                 <img
                                   src={profile.photoURL}
                                   alt={profile.displayName}
                                   className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                                 />
                                 <div className="absolute bottom-4 right-0 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
                               </div>
                               <h2 className="text-xl font-bold mb-1">{profile.displayName}</h2>
                               <p className="text-sm text-gray-500 mb-4">Rungta College of Engineering & Technology(Bhilai)</p>
                               <div className="flex justify-center space-x-3 mb-4">
                                 {profile.email && (
                                   <a href={`mailto:${profile.email}`} className="text-gray-600 hover:text-blue-500 transition-colors">
                                     <Mail className="w-5 h-5" />
                                   </a>
                                 )}
                                 {profile.linkedinUrl && (
                                   <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500 transition-colors">
                                     <SiLinkedin className="w-5 h-5" />
                                   </a>
                                 )}
                                 {profile.portfolioUrl && (
                                   <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500 transition-colors">
                                     <Globe className="w-5 h-5" />
                                   </a>
                                 )}
                                 <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500 transition-colors">
                                   <Github className="w-5 h-5" />
                                 </a>
                               </div>
                               
                               {/* <div className="flex justify-between items-center px-2 py-3 bg-gray-50 rounded-lg">
                                 <div className="text-center">
                                   <p className="text-xs text-gray-500">Current Streak</p>
                                   <p className="font-bold text-green-600">{currentStreak} days</p>
                                 </div>
                                 <div className="h-8 w-px bg-gray-200"></div>
                                 <div className="text-center">
                                   <p className="text-xs text-gray-500">Longest Streak</p>
                                   <p className="font-bold text-blue-600">{longestStreak} days</p>
                                 </div>
                               </div> */}
                             </CardContent>
                           </Card>
                           
                           <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    Platform Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">LeetCode</span>
                      <span className="text-sm font-medium">{stats.leetcodeSolved} </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">GeeksForGeeks</span>
                      <span className="text-sm font-medium">{stats.gfgSolved} </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CodeChef</span>
                      <span className="text-sm font-medium">{stats.codechefProblemsSolved} </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">GitHub</span>
                      <span className="text-sm font-medium">{stats.githubRepos} Repo </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

  
              {/* Performance Metrics Card */}
              <Card className="md:col-span-1 shadow-lg border-0">
                <CardHeader className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-purple-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">LeetCode Ranking</span>
                        <span className="text-xs font-medium">{stats.leetcodeRanking.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">LeetCode Acceptance Rate</span>
                        <span className="text-xs font-medium">{stats.leetcodeAcceptanceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.leetcodeAcceptanceRate}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">GFG Score</span>
                        <span className="text-xs font-medium">{stats.gfgScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">CodeChef Rating</span>
                        <span className="text-xs font-medium">{stats.codechefRating}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              {/* Community Contributions Card */}
                           <Card className="md:col-span-1 shadow-lg border-0">
                             <CardHeader className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50">
                               <CardTitle className="text-sm font-medium flex items-center gap-2">
                                 <Users className="w-4 h-4 text-teal-500" />
                                 Platform Engagement
                               </CardTitle>
                             </CardHeader>
                             <CardContent className="p-4">
                               <div className="space-y-4">
                                 <div>
                                   <p className="text-xs text-gray-500 mb-1">LeetCode Contributions</p>
                                   <div className="flex items-center">
                                     <div className="text-lg font-bold text-yellow-600">{stats.leetcodeContributionPoints}</div>
                                     <span className="text-xs ml-2 text-gray-500">points</span>
                                   </div>
                                 </div>
                                 
                                 <div>
                                   <p className="text-xs text-gray-500 mb-1">CodeChef Contests</p>
                                   <div className="flex items-center">
                                     <div className="text-lg font-bold text-amber-700">{stats.codechefContestAttended}</div>
                                     <span className="text-xs ml-2 text-gray-500">participated</span>
                                   </div>
                                 </div>
                                 
                                 <div>
                                   <p className="text-xs text-gray-500 mb-1">GitHub Activity</p>
                                   <div className="flex items-center">
                                     <div className="text-lg font-bold text-gray-800">{stats.githubRepos}</div>
                                     <span className="text-xs ml-2 text-gray-500">repositories</span>
                                   </div>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
            </div>
            
  
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <Card className="shadow-lg border-0 transform transition-all hover:scale-105">
                             <CardHeader className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                               <CardTitle className="text-sm font-medium flex items-center gap-2">
                                 <Code className="w-4 h-4 text-blue-500" />
                                 Total Problems Solved
                               </CardTitle>
                             </CardHeader>
                             <CardContent className="p-4 pt-0">
                              
                             <div className="text-3xl font-bold text-blue-600">
  {(stats.leetcodeSolved || 0) + (stats.gfgSolved || 0) + (stats.codechefProblemsSolved || 0)}
</div>

                               <p className="text-xs text-gray-500 mt-1">Across all platforms</p>
                             </CardContent>
                           </Card>
               
                           <Card className="shadow-lg border-0 transform transition-all hover:scale-105">
                             <CardHeader className="p-4 bg-gradient-to-r from-amber-50 to-amber-100">
                               <CardTitle className="text-sm font-medium flex items-center gap-2">
                                 <Trophy className="w-4 h-4 text-amber-500" />
                                 Best Contest Rating
                               </CardTitle>
                             </CardHeader>
                             <CardContent className="p-4 pt-0">
                               <div className="text-3xl font-bold text-amber-600">
                                 {stats.codechefRating}
                               </div>
                               <p className="text-xs text-gray-500 mt-1">CodeChef</p>
                             </CardContent>
                           </Card>
               
                           <Card className="shadow-lg border-0 transform transition-all hover:scale-105">
                             <CardHeader className="p-4 bg-gradient-to-r from-purple-50 to-purple-100">
                               <CardTitle className="text-sm font-medium flex items-center gap-2">
                                 <Github className="w-4 h-4 text-purple-500" />
                                 GitHub Repositories
                               </CardTitle>
                             </CardHeader>
                             <CardContent className="p-4 pt-0">
                               <div className="text-3xl font-bold text-purple-600">
                                 {stats.githubRepos}
                               </div>
                               <p className="text-xs text-gray-500 mt-1">Public projects</p>
                             </CardContent>
                           </Card>
            </div>
  
            {/* Progress Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LeetCode Progress */}
              <Card className="shadow-lg border-0">
                             <CardHeader className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                               <CardTitle className="text-sm font-medium flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <Activity className="w-4 h-4 text-blue-500" />
                                   Coding Progress Distribution
                                 </div>
                                 <span className="text-blue-500 text-xs">
  {(stats.leetcodeSolved || 0) + (stats.gfgSolved || 0) + (stats.codechefProblemsSolved || 0)} problems
</span>

                               </CardTitle>
                             </CardHeader>
                             <CardContent className="p-4">
                               <div className="h-64">
                                 <ResponsiveContainer width="100%" height="100%">
                                   <PieChart>
                                     <Pie
                                       data={[
                                         { name: 'LeetCode', value: stats.leetcodeSolved },
                                         { name: 'GFG', value: stats.gfgSolved },
                                         { name: 'CodeChef', value: stats.codechefProblemsSolved },
                                       ]}
                                       cx="50%"
                                       cy="50%"
                                       outerRadius={80}
                                       innerRadius={40}
                                       fill="#8884d8"
                                       dataKey="value"
                                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                     >
                                       <Cell key="lc" fill="#FFA116" />
                                       <Cell key="gfg" fill="#2F8D46" />
                                       <Cell key="cc" fill="#5B4638" />
                                     </Pie>
                                     <Tooltip />
                                   </PieChart>
                                 </ResponsiveContainer>
                               </div>
                               
                               <div className="grid grid-cols-3 gap-2 mt-4">
                                 <div className="flex items-center">
                                   <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                   <span className="text-xs">LeetCode</span>
                                 </div>
                                 <div className="flex items-center">
                                   <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                                   <span className="text-xs">GeeksForGeeks</span>
                                 </div>
                                 <div className="flex items-center">
                                   <div className="w-3 h-3 rounded-full bg-amber-800 mr-2"></div>
                                   <span className="text-xs">CodeChef</span>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
  
              {/* Platform Stats */}
             

              <Card className="md:col-span-1 shadow-lg rounded-lg border-0">
                              <CardHeader className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                  <Code className="w-5 h-5 text-blue-500" />
                                  Problem Solving Breakdown
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="p-3 text-center border-b font-medium text-xs">Platform</th>
                                        <th className="p-3 text-center border-b font-medium text-xs">Easy</th>
                                        <th className="p-3 text-center border-b font-medium text-xs">Medium</th>
                                        <th className="p-3 text-center border-b font-medium text-xs">Hard</th>
                                        <th className="p-3 text-center border-b font-medium text-xs">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="hover:bg-blue-50 transition-colors">
                                        <td className="p-3 border-b font-medium text-xs">
                                          <div className="flex items-center">
                                            <SiLeetcode className="w-4 h-4 mr-1 text-yellow-500" />
                                            LeetCode
                                          </div>
                                        </td>
                                        <td className="p-3 border-b text-center text-xs">{stats.leetcodeEasySolved}</td>
                                        <td className="p-3 border-b text-center text-xs">{stats.leetcodeMediumSolved}</td>
                                        <td className="p-3 border-b text-center text-xs">{stats.leetcodeHardSolved}</td>
                                        <td className="p-3 border-b text-center font-bold text-xs">{stats.leetcodeSolved}</td>
                                      </tr>
                                      <tr className="hover:bg-green-50 transition-colors">
                                        <td className="p-3 border-b font-medium text-xs">
                                          <div className="flex items-center">
                                            <SiGeeksforgeeks className="w-4 h-4 mr-1 text-green-600" />
                                            GFG
                                          </div>
                                        </td>
                                        <td className="p-3 border-b text-center text-xs">{stats.gfgEasy + stats.gfgBasic}</td>
                                        <td className="p-3 border-b text-center text-xs">{stats.gfgMedium}</td>
                                        <td className="p-3 border-b text-center text-xs">{stats.gfgHard}</td>
                                        <td className="p-3 border-b text-center font-bold text-xs">{stats.gfgSolved}</td>
                                      </tr>
                                      <tr className="hover:bg-amber-50 transition-colors">
                                        <td className="p-3 border-b font-medium text-xs">
                                          <div className="flex items-center">
                                            <SiCodechef className="w-4 h-4 mr-1 text-amber-700" />
                                            CodeChef
                                          </div>
                                        </td>
                                        <td className="p-3 border-b text-center text-xs" colSpan="3">Contests: {stats.codechefContestAttended}</td>
                                        <td className="p-3 border-b text-center font-bold text-xs">{stats.codechefProblemsSolved}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </CardContent>
                            </Card>
            </div>
          </div>
  
          {/* Right Side (Contest Section) */}
          <div className="md:col-span-1">
    <Card className="border rounded-lg shadow-lg bg-white">
      <CardHeader className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold">🚀 Upcoming Contests</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Platform Filter Dropdown */}
        <select
          className="mb-4 p-2 border rounded w-full"
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
        >
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        {loading ? (
          <p className="text-gray-600">Loading contests...</p>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-96 custom-scrollbar">
            {filteredContests.slice(0, 30).map((contest) => (
              <div
                key={contest._id}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-300"
              >
                <h3 className="text-sm font-semibold text-gray-800">{contest.contestName}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  🕒 {new Date(contest.contestStartDate).toLocaleString()} -{" "}
                  {new Date(contest.contestEndDate).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">🎯 {contest.platform}</p>
                <a
                  href={contest.contestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  View Contest →
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard