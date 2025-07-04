import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  skills: Skill[];
  availability: Availability[];
  experience: ExperienceLevel;
  interests: string[];
  bio: string;
  githubUrl?: string;
  linkedinUrl?: string;
  leetcodeUrl?: string;
  gfgUrl?: string;
  hackerrankUrl?: string;
  codechefUrl?: string;
  portfolioUrl?: string;
  certificates: Certificate[]; 
  resume?: string; 
  branch: string;
  achievements: string[]; 
  problemSolvingLevel: string;
  developerLevel: string;
  githubUsername?: string;
  public_repos?: number;
  total_problems_solved?: number;
  total_solved_questions?: number;
  rankScore?: number;
  year?: string;
  leetcodeUsername: string | null | undefined;
  gfgUsername: string | null | undefined;
  githubUrlusername: string | null | undefined;
  lastStatsUpdate?: number;
  codechefRating?: number;
  id: string
  name: string
}

export interface MonthlyLeaderboard {
  month: number
  year: number
  users: MonthlyUserStats[]
}

export interface MonthlyUserStats extends User {
  position: number
  previousPosition: number | null
}



export interface UserStats {
  lastUpdated: number;
  leetcodeSolved: number;
  gfgSolved: number;
  githubRepos: number;
}


export interface Certificate {
  name: string;
  issuer: string;
  dateIssued: Date;
  certificateUrl?: string; 
}

export interface PostNotification {
  id: string;
  type: "like" | "comment";
  postId: string;
  postTitle?: string;
  createdAt: Timestamp | Date; 
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  receiverId: string;
  commentText?: string;
  read: boolean;
}



export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  media: PostMedia[];
  hashtags: string[];
  likes: string[]; 
  comments: Comment[];
  shares: number;
  createdAt: Timestamp | Date; 
  updatedAt: Timestamp | Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  likes: string[]; 
  replies: Comment[]
  createdAt: Timestamp | Date; 
}


export interface PostMedia {
  id: string
  url: string
  type: "image" | "video"
  thumbnailUrl?: string // For videos
}

export interface Reply {
  id: string
  commentId: string
  authorId: string
  author: User
  content: string
  likes: string[]
  createdAt: Timestamp | Date; 
  updatedAt: Timestamp | Date;
}

export interface PostFormData {
  content: string
  media: File[]
  hashtags: string[]
}

export interface PostAction {
  type: "like" | "comment" | "share"
  userId: string
  postId: string
  timestamp: Date
}



export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content: string;
  createdAt: string;
}

export interface TeamRequest {
  receiverPhoto: any;
  id: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  receiverId: string;
  receiverName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: any;
  acceptedAt?: any;
  rejectedAt?: any;
}
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Skill {
  name: string;
  level: SkillLevel;
  category: SkillCategory;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SkillCategory = 
  | 'frontend' 
  | 'backend' 
  | 'mobile' 
  | 'ui/ux' 
  | 'product' 
  | 'business' 
  | 'data' 
  | 'ai_ml'
  | 'cybersecurity'
  | 'devops'
  | 'cloud'
  | 'blockchain'
  | 'iot'
  | 'game_dev'
  | 'ar_vr'
  | 'content_creation'
  | 'marketing'
  | 'writing'
  | 'finance';

export interface Availability {
  day: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Hackathon {
  id: string
  title: string
  image: string
  organizer: string
  timeLeft: string
  isOnline: boolean
  prizeAmount: number
  participants: number
  startDate: string
  endDate: string
  tags: string[]
  status: string
  RegisterLink: string
  description: string
  requirements: string[]
  rules: string[]
  timeline: {
    phase: string
    date: string
  }[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}