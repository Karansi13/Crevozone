import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  or
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { User, SkillCategory, TeamRequest } from '@/types';
import {
  Users, Search, Filter, Code, Palette, Phone, Database,
  Layout, Briefcase, LineChart, X,
  Loader,
  Link2,
  FileText,
  Award,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Gamepad, Video, Megaphone, Pen, DollarSign, Glasses, Wifi, Cloud, Server, Shield, Brain, } from 'lucide-react';

const skillCategories: { id: SkillCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'frontend', label: 'Frontend', icon: <Layout className="h-5 w-5 text-blue-500" /> },
  { id: 'backend', label: 'Backend', icon: <Database className="h-5 w-5 text-green-500" /> },
  { id: 'mobile', label: 'Mobile', icon: <Phone className="h-5 w-5 text-purple-500" /> },
  { id: 'ui/ux', label: 'UI/UX', icon: <Palette className="h-5 w-5 text-pink-500" /> },
  { id: 'product', label: 'Product', icon: <Code className="h-5 w-5 text-indigo-500" /> },
  { id: 'business', label: 'Business', icon: <Briefcase className="h-5 w-5 text-yellow-500" /> },
  { id: 'data', label: 'Data', icon: <LineChart className="h-5 w-5 text-red-500" /> },

  // New Categories
  { id: 'ai_ml', label: 'AI/ML', icon: <Brain className="h-5 w-5 text-orange-500" /> },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: <Shield className="h-5 w-5 text-teal-500" /> },
  { id: 'devops', label: 'DevOps', icon: <Server className="h-5 w-5 text-gray-500" /> },
  { id: 'cloud', label: 'Cloud Computing', icon: <Cloud className="h-5 w-5 text-cyan-500" /> },
  { id: 'blockchain', label: 'Blockchain', icon: <Link2 className="h-5 w-5 text-lime-500" /> },
  { id: 'iot', label: 'IoT', icon: <Wifi className="h-5 w-5 text-amber-500" /> },
  { id: 'game_dev', label: 'Game Development', icon: <Gamepad className="h-5 w-5 text-fuchsia-500" /> },
  { id: 'ar_vr', label: 'AR/VR', icon: <Glasses className="h-5 w-5 text-emerald-500" /> },
  { id: 'content_creation', label: 'Content Creation', icon: <Video className="h-5 w-5 text-rose-500" /> },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className="h-5 w-5 text-purple-600" /> },
  { id: 'writing', label: 'Writing', icon: <Pen className="h-5 w-5 text-blue-600" /> },
  { id: 'finance', label: 'Finance', icon: <DollarSign className="h-5 w-5 text-green-600" /> }
];


// const ADMIN_EMAILS = ['karan.kalsi@rungta.org', '6601792@rungta.org']
const ADMIN_EMAILS = ['drsoourabhrungta@rungta.org']

export default function Teams() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<SkillCategory[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

    //     const usersRef = collection(db, 'users');
    //     const querySnapshot = await getDocs(usersRef);
    //     const usersData = querySnapshot.docs
    //       .filter(doc => doc.id !== user.uid)
    //       .map(doc => ({
    //         uid: doc.id,
    //         ...doc.data()
    //       } as User));
    //     setUsers(usersData);
    //     console.log(usersData)
    //   } catch (error) {
    //     console.error('Error fetching users:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersData = querySnapshot.docs
        .filter(doc => {
          const userData = doc.data();
          return doc.id !== user.uid && !ADMIN_EMAILS.includes(userData.email);
        })
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as User));
      setUsers(usersData);
      // console.log(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
    const fetchRequests = async () => {
      if (!user) return;
      try {
        const requestsRef = collection(db, 'teamRequests');
        const userRequestsQuery = query(
          requestsRef,
          or(
            where('senderId', '==', user.uid),
            where('receiverId', '==', user.uid)
          )
        );

        const requestsSnapshot = await getDocs(userRequestsQuery);
        const requestsData = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TeamRequest));

        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchUsers();
    fetchRequests();
  }, [user]);

  const handleConnect = async (targetUser: User) => {
    if (!user) return;

    // Check if a request already exists
    const existingRequest = requests.find(
      req =>
        (req.senderId === user.uid && req.receiverId === targetUser.uid) ||
        (req.senderId === targetUser.uid && req.receiverId === user.uid)
    );

    if (existingRequest) {
      // console.log('Request already exists');
      return;
    }

    setConnectingTo(targetUser.uid);
    try {
      const requestsRef = collection(db, 'teamRequests');
      const newRequest = {
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL,
        receiverId: targetUser.uid,
        receiverName: targetUser.displayName,
        status: 'pending',
        message: `Hi ${targetUser.displayName}, I'd like to connect and possibly team up!`,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(requestsRef, newRequest);
      setRequests(prev => [...prev, { ...newRequest, id: docRef.id }]);
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setConnectingTo(null);
    }
  };

  const handleAcceptRequest = async (request: TeamRequest) => {
    if (!user || user.uid !== request.receiverId) return;

    try {
      const requestDoc = doc(db, 'teamRequests', request.id);
      await updateDoc(requestDoc, {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });

      setRequests(prev => prev.map(req =>
        req.id === request.id ? { ...req, status: 'accepted' } : req
      ));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (request: TeamRequest) => {
    if (!user || user.uid !== request.receiverId) return;

    try {
      const requestDoc = doc(db, 'teamRequests', request.id);
      await updateDoc(requestDoc, {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });

      setRequests(prev => prev.filter(req => req.id !== request.id));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleRemoveConnection = async (request: TeamRequest) => {
    if (!user) return;

    try {
      const requestDoc = doc(db, 'teamRequests', request.id);
      await deleteDoc(requestDoc);

      setRequests(prev => prev.filter(req => req.id !== request.id));
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const getRequestStatus = (targetUser: User) => {
    const existingRequest = requests.find(
      req =>
        (req.senderId === user?.uid && req.receiverId === targetUser.uid) ||
        (req.senderId === targetUser.uid && req.receiverId === user?.uid)
    );

    return existingRequest ? existingRequest.status : null;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skills?.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSkills = selectedSkills.length === 0 ||
      user.skills?.some(skill => selectedSkills.includes(skill.category));

    const matchesExperience = selectedExperience.length === 0 ||
      selectedExperience.includes(user.experience);

    return matchesSearch && matchesSkills && matchesExperience;
  }).sort((a, b) => {
    const statusA = getRequestStatus(a) === 'accepted' ? 1 : 0;
    const statusB = getRequestStatus(b) === 'accepted' ? 1 : 0;
    return statusA - statusB; // Moves connected users to the end
  });

  const toggleSkill = (skillCategory: SkillCategory) => {
    setSelectedSkills(prev =>
      prev.includes(skillCategory)
        ? prev.filter(s => s !== skillCategory)
        : [...prev, skillCategory]
    );
  };

  const toggleExperience = (experience: string) => {
    setSelectedExperience(prev =>
      prev.includes(experience)
        ? prev.filter(e => e !== experience)
        : [...prev, experience]
    );
  };
 

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader /></div>;
  }

  return (
    <div className="mt-10 sm:mt-16 md:mt-20">
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
    <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-6 sm:mb-8"
  >
    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center sm:text-left w-full sm:w-auto">
      Find Teammates
    </h1>
    <Link to="/create-team" className="w-full sm:w-auto">
      <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all text-white">
        <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Create Team
      </Button>
    </Link>
  </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search by name or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>
          </div>

          {/* Skill Categories */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skillCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleSkill(category.id)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${selectedSkills.includes(category.id)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  {category.icon}
                  <span className="ml-2">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
            <div className="flex gap-2">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => toggleExperience(level)}
                  className={`px-3 py-1 rounded-full text-sm ${selectedExperience.includes(level)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(targetUser => (
            <div
              key={targetUser.uid}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedUser(targetUser)} // Add this line
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center" onClick={() => navigate(`/profile/${targetUser.erpId}`)}>
                  {targetUser.photoURL ? (
                    <img
                      src={targetUser.photoURL}
                      alt={targetUser.displayName}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-3">
                    <h3 className="font-semibold">{targetUser.displayName}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {targetUser.experience} Developer
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (getRequestStatus(targetUser) === 'accepted') {
                      const existingRequest = requests.find(
                        req =>
                          (req.senderId === user?.uid && req.receiverId === targetUser.uid) ||
                          (req.senderId === targetUser.uid && req.receiverId === user?.uid)
                      );
                      if (existingRequest) {
                        handleRemoveConnection(existingRequest);
                      }
                    } else {
                      handleConnect(targetUser);
                    }
                  }}
                  disabled={connectingTo === targetUser.uid || getRequestStatus(targetUser) === 'pending'}
                  className={`
    ${getRequestStatus(targetUser) === 'accepted'
                      ? 'bg-green-500 hover:bg-red-500 text-white transition-colors'
                      : 'bg-blue-500 text-white'}
  `}
                >
                  {connectingTo === targetUser.uid
                    ? 'Sending...'
                    : getRequestStatus(targetUser) === 'pending'
                      ? 'Pending'
                      : getRequestStatus(targetUser) === 'accepted'
                        ? (
                          <div className="flex items-center">
                            <span>Connected</span>
                            <X className="w-4 h-4 ml-1" />
                          </div>
                        )
                        : 'Connect'}
                </Button>
              </div>

              {targetUser.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {targetUser.bio}
                </p>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {targetUser.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-sm"
                    >
                      {skillCategories.find(cat => cat.id === skill.category)?.icon}
                      <span className="ml-1">{skill.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Profile Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.displayName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold">{selectedUser.displayName}</h2>
                    <p className="text-gray-500 capitalize">{selectedUser.experience} Developer</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
    
              <div className="space-y-8">
                {/* About Section */}
                {selectedUser.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      About
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedUser.bio}</p>
                  </div>
                )}
    
                {/* Academic Information */}
                {(selectedUser.branch || selectedUser.year) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                      Academic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      {selectedUser.branch && (
                        <div>
                          <span className="text-gray-500">Branch:</span>
                          <p className="font-medium">{selectedUser.branch}</p>
                        </div>
                      )}
                      {selectedUser.year && (
                        <div>
                          <span className="text-gray-500">Year:</span>
                          <p className="font-medium">{selectedUser.year}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
    
                {/* Skills Section */}
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <ShieldCheck className="w-5 h-5 mr-2 text-purple-500" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                        >
                          {skillCategories.find(cat => cat.id === skill.category)?.icon}
                          <span className="ml-2">{skill.name}</span>
                          <span className="ml-1 text-gray-500">• {skill.level}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
    
                {/* Achievements Section */}
                {selectedUser.achievements && selectedUser.achievements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-yellow-500" />
                      Achievements
                    </h3>
                    <div className="space-y-2">
                      {selectedUser.achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg"
                        >
                          <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
    
                {/* Certificates Section */}
                {selectedUser.certificates && selectedUser.certificates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                      Certificates
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedUser.certificates.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{cert.name}</h4>
                            <p className="text-sm text-gray-500">
                              {cert.issuer} - {new Date(cert.dateIssued).toLocaleDateString()}
                            </p>
                          </div>
                          {cert.certificateUrl && (
                            <a
                              href={cert.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 flex items-center"
                            >
                              <Link2 className="w-4 h-4 mr-1" />
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
    
                {/* Resume Section */}
                {selectedUser.resume && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-red-500" />
                      Resume
                    </h3>
                    <a
                      href={selectedUser.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 bg-gray-50 p-4 rounded-lg w-fit"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Resume</span>
                    </a>
                  </div>
                )}
    
                {/* Links Section */}
                {(selectedUser.githubUrl || selectedUser.linkedinUrl || 
                  selectedUser.portfolioUrl || selectedUser.leetcodeUrl || 
                  selectedUser.gfgUrl) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Link2 className="w-5 h-5 mr-2 text-blue-500" />
                      Links
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedUser.githubUrl && (
                        <a
                          href={selectedUser.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-gray-50 p-3 rounded-lg"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>GitHub Profile</span>
                        </a>
                      )}
                      {selectedUser.linkedinUrl && (
                        <a
                          href={selectedUser.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-gray-50 p-3 rounded-lg"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                      {selectedUser.portfolioUrl && (
                        <a
                          href={selectedUser.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-gray-50 p-3 rounded-lg"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>Portfolio Website</span>
                        </a>
                      )}
                      {selectedUser.leetcodeUrl && (
                        <a
                          href={selectedUser.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-gray-50 p-3 rounded-lg"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>LeetCode Profile</span>
                        </a>
                      )}
                      {selectedUser.gfgUrl && (
                        <a
                          href={selectedUser.gfgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-gray-50 p-3 rounded-lg"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>GeeksForGeeks Profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
    
              {/* Connect Button */}
              <div className="mt-8 flex justify-end">
                {getRequestStatus(selectedUser) !== 'accepted' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(selectedUser);
                      setSelectedUser(null);
                    }}
                    disabled={connectingTo === selectedUser.uid}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {connectingTo === selectedUser.uid ? 'Sending Request...' : 'Send Connection Request'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}