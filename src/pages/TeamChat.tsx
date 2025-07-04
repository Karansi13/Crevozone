import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Team, Message, User } from "@/types";
import {
  Send,
  Users,
  Info,
  Clock,
  UserPlus,
  Zap,
  Copy,
  Check,
  X,
  Trash
} from "lucide-react";
import { formatDistance } from "date-fns";

function TeamChat() {
  const { teamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState<string | null>(
    null
  );
  const [inviteLink, setInviteLink] = useState<string>("");
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [copyLinkStatus, setCopyLinkStatus] = useState<"copy" | "copied">(
    "copy"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate Invite Link
  const generateInviteLink = async () => {
    if (!teamId || !user) return;

    try {
      const inviteRef = doc(collection(db, "team-invites"));
      await setDoc(inviteRef, {
        teamId: teamId,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      });

      const link = `${window.location.origin}/join-team/${inviteRef.id}`;
      setInviteLink(link);
      setShowInviteLink(true);
      toast.success("Invite link generated successfully!");
    } catch (error) {
      console.error("Error generating invite link:", error);
      toast.error("Failed to generate invite link");
    }
  };

  // Copy Invite Link
  const copyInviteLink = () => {
    if (!inviteLink) return;

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setCopyLinkStatus("copied");
        toast.success("Invite link copied to clipboard");

        setTimeout(() => {
          setCopyLinkStatus("copy");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy invite link");
      });
  };

  // Close Invite Link Section
  const closeInviteLink = () => {
    setShowInviteLink(false);
    setInviteLink("");
  };

  // Handle Team Join
  const handleJoinTeam = async (inviteId: string) => {
    if (!user) {
      toast.error("You must be logged in to join a team");
      navigate("/login");
      return;
    }

    try {
      const inviteDocRef = doc(db, "team-invites", inviteId);
      const inviteDoc = await getDoc(inviteDocRef);

      if (!inviteDoc.exists()) {
        toast.error("Invalid invite link");
        return;
      }

      const inviteData = inviteDoc.data();

      if (
        inviteData.status !== "active" ||
        new Date(inviteData.expiresAt) < new Date()
      ) {
        toast.error("Invite link has expired");
        return;
      }

      const teamDocRef = doc(db, "teams", inviteData.teamId);

      await updateDoc(teamDocRef, {
        members: arrayUnion(user.uid),
      });

      await updateDoc(inviteDocRef, {
        status: "used",
        usedBy: user.uid,
        usedAt: new Date().toISOString(),
      });

      toast.success("Successfully joined the team!");
      navigate(`/team/${inviteData.teamId}`);
    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("Failed to join team");
    }
  };

  useEffect(() => {
    if (!teamId) return;
    const fetchTeam = async () => {
      const teamRef = collection(db, "teams");
      const teamQuery = query(teamRef, where("__name__", "==", teamId));
      const teamSnapshot = await getDocs(teamQuery);
      if (!teamSnapshot.empty) {
        const teamData = {
          id: teamSnapshot.docs[0].id,
          ...teamSnapshot.docs[0].data(),
        } as Team;
        setTeam(teamData);

        // Fetch members using document IDs directly
        const membersData = await Promise.all(
          (teamData.members || []).map(async (memberId) => {
            const memberDocRef = doc(db, "users", memberId);
            const memberDocSnap = await getDoc(memberDocRef);
            return {
              uid: memberDocSnap.id,
              ...memberDocSnap.data(),
              displayName: memberDocSnap.data()?.displayName || "Anonymous",
            } as User;
          })
        );

        setMembers(membersData);
      }
    };
    fetchTeam();

    const messagesRef = collection(db, "teams", teamId, "messages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [teamId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !teamId || !newMessage.trim()) {
      console.error("Missing user, teamId, or message");
      return;
    }

    // console.log("Sending message", { user, teamId, newMessage });

    setSending(true);
    try {
      const messagesRef = collection(db, "teams", teamId, "messages");
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || "Anonymous",
        senderPhoto: user.photoURL || "",
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
      });
      // console.log("Message sent successfully");
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error.message); // Log the error message
      if (error.code) {
        console.error("Firebase error code:", error.code); // Log the error code
      }
    } finally {
      setSending(false);
    }
  };

  const toggleMemberDetails = (memberId: string) => {
    setShowMemberDetails(showMemberDetails === memberId ? null : memberId);
  };

  const handleRemoveMember = async (memberId: string) => {
    // Check if the user is the admin or the team creator
    if (!(team.createdBy === user?.uid)) {
      toast.error("You don't have permission to remove members!");
      return;
    }
  
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        const teamDocRef = doc(db, "teams", teamId);
        await updateDoc(teamDocRef, {
          members: arrayRemove(memberId),
        });
  
        // Remove member from state
        setMembers((prevMembers) => prevMembers.filter((m) => m.uid !== memberId));
        toast.success("Member removed successfully!");
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error("Failed to remove member");
      }
    }
  };
  
  

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-pulse text-blue-500 flex items-center space-x-2">
          <Clock className="h-6 w-6 animate-spin" />
          <span className="text-xl font-semibold">Loading Team...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-20">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100 h-[calc(100vh-7rem)] w-full sm:w-10/12 lg:w-8/12 xl:w-7/12 flex flex-col lg:flex-row">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Team Header */}
            <div className="p-3 sm:p-4 border-b bg-blue-50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-blue-800 truncate">
                  {team?.name}
                </h1>
              </div>
              <Button
                variant="outline"
                className="text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                onClick={generateInviteLink}
              >
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Invite
                Members
              </Button>
            </div>

             {/* Invite Link Section */}
             {showInviteLink && inviteLink && (
              <div className="p-4 bg-blue-50 flex items-center justify-between relative">
                <div className="flex-1 mr-4">
                  <p className="text-sm text-blue-800 font-medium">Share this invite link with your team</p>
                  <input 
                    type="text" 
                    readOnly 
                    value={`${inviteLink}`} 
                    className="w-full text-sm bg-white rounded-md p-2 mt-2 truncate"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={copyInviteLink}
                    className="text-blue-600 hover:bg-blue-100"
                  >
                    {copyLinkStatus === 'copy' ? (
                      <Copy className="h-5 w-5 mr-2" />
                    ) : (
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                    )}
                    {copyLinkStatus === 'copy' ? 'Copy Link' : 'Copied!'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={closeInviteLink}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}


            {/* Messages Section (Scrollable on Mobile) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-gray-50 max-h-[calc(100vh-200px)]">
              {messages.map((message) => {
                const isCurrentUser = message.senderId === user?.uid;
                const senderName = message.senderName || "Anonymous";
                const senderPhoto = message.senderPhoto || "";
                const messageTime = formatDistance(
                  new Date(message.createdAt),
                  new Date(),
                  { addSuffix: true }
                );

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div className="flex items-end space-x-2">
                      {senderPhoto ? (
                        <img
                          src={senderPhoto}
                          alt={senderName}
                          className="h-8 w-8 rounded-full border-2 border-blue-200"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-lg font-bold">
                            {senderName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isCurrentUser
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-300"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs text-gray-500 mt-1 block text-right">
                          {messageTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input (Fixed at Bottom, Small on Mobile) */}
            <form
  onSubmit={handleSendMessage}
  className="p-3 sm:p-4 md:p-5 border-t bg-white fixed bottom-0 w-full max-w-screen-lg mx-auto left-0 right-0"
>

              <div className="flex space-x-2 w-full">
                <input
                  type="text"
                  className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ease-in-out text-sm sm:text-xs"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Team Members Sidebar */}
          <div className="w-full lg:w-72 border-t lg:border-l lg:border-t-0 bg-gray-50 p-3 sm:p-4 overflow-y-auto">
  <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-blue-800">
    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
    Team Members ({members.length})
  </h2>
  <div className="space-y-3">
    {members && members.length > 0 ? (
      members.map((member) => {
        const displayName = member.displayName || "Anonymous";
        const photoURL = member.photoURL || "";
        const experience = member.experience || "Unknown";
        const initialLetter = displayName ? displayName.charAt(0) : "?";

        return (
          <div
            key={member.uid}
            className="bg-white rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div
              className="flex items-center space-x-3 flex-1"
              onClick={() => toggleMemberDetails(member.uid)}
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-blue-200 flex-shrink-0"
                />
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs sm:text-sm font-bold">
                    {initialLetter}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Zap className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{experience} Developer</span>
                </p>
              </div>
            </div>

            {/* Show delete button only for admin */}
            {(team.createdBy === user?.uid) && (
  <button
    onClick={() => handleRemoveMember(member.uid)}
    className="text-red-600 hover:text-red-800 p-1"
  >
    <Trash className="h-5 w-5" />
  </button>
)}

          </div>
        );
      })
    ) : (
      <p className="text-gray-500 text-center text-sm">No team members found</p>
    )}
  </div>
</div>

        </div>
      </div>
    </div>
  );
}

export default TeamChat;