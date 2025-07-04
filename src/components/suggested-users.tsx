import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where, serverTimestamp, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { Loader } from "lucide-react";

const ADMIN_EMAILS = ['drsoourabhrungta@rungta.org']

export function SuggestedUsers() {
  const navigate = useNavigate()
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState(new Set<string>());

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const usersRef = collection(db, "users");
        const requestsRef = collection(db, "teamRequests");

        const connectionsQuery = query(
          requestsRef,
          where("status", "==", "accepted"),
          where("senderId", "==", user.uid)
        );
        const connectionsQuery2 = query(
          requestsRef,
          where("status", "==", "accepted"),
          where("receiverId", "==", user.uid)
        );

        const [connectionsSnapshot, connectionsSnapshot2] = await Promise.all([
          getDocs(connectionsQuery),
          getDocs(connectionsQuery2),
        ]);

        const connectedUserIds = new Set<string>();
        connectionsSnapshot.forEach((doc) => connectedUserIds.add(doc.data().receiverId));
        connectionsSnapshot2.forEach((doc) => connectedUserIds.add(doc.data().senderId));

        const pendingQuery = query(
          requestsRef,
          where("senderId", "==", user.uid),
          where("status", "==", "pending")
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingUserIds = new Set<string>();
        pendingSnapshot.forEach((doc) => pendingUserIds.add(doc.data().receiverId));
        setPendingRequests(pendingUserIds);

        const querySnapshot = await getDocs(usersRef);
        let usersData = querySnapshot.docs
          .filter((doc) => {
            const userData = doc.data();
            return (
              doc.id !== user.uid && 
              !connectedUserIds.has(doc.id) && 
              !pendingUserIds.has(doc.id) &&
              !ADMIN_EMAILS.includes(userData.email) // Filter out admin users
            );
          })
          .map((doc) => ({
            uid: doc.id,
            ...doc.data(),
          } as User));

        usersData = usersData.sort(() => 0.5 - Math.random()).slice(0, 8);
        setSuggestedUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleConnect = async (targetUser: User) => {
    if (!user) return;
    setConnectingTo(targetUser.uid);
    try {
      const requestsRef = collection(db, "teamRequests");
      const existingRequestQuery = query(
        requestsRef,
        where("senderId", "==", user.uid),
        where("receiverId", "==", targetUser.uid)
      );
      const existingRequestSnapshot = await getDocs(existingRequestQuery);
      if (!existingRequestSnapshot.empty) {
        setConnectingTo(null);
        return;
      }

      const newRequest = {
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL,
        receiverId: targetUser.uid,
        receiverName: targetUser.displayName,
        status: "pending",
        message: `Hi ${targetUser.displayName}, I'd like to connect!`,
        createdAt: serverTimestamp(),
      };

      await addDoc(requestsRef, newRequest);
      setPendingRequests((prev) => new Set([...prev, targetUser.uid]));
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setConnectingTo(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sticky">
      <div className="flex justify-between items-center mb-4 w-[22vw]">
        <h2 className="font-semibold text-xl">Suggested for you</h2>
        <Link to="/teams" className="text-sm text-blue-500 hover:text-blue-600">
          See All
        </Link>
      </div>
      {loading ? (
        <p className="text-center text-gray-500"><Loader/></p>
      ) : suggestedUsers.length === 0 ? (
        <p className="text-center text-gray-500">No users found</p>
      ) : (
        <div className="space-y-4">
          {suggestedUsers.map((suggestedUser) => (
            <div key={suggestedUser.uid} className="flex items-center justify-between" 
            >
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${suggestedUser.erpId}`)}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={suggestedUser.photoURL} />
                  <AvatarFallback>{suggestedUser.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{suggestedUser.displayName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="ml-4 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => handleConnect(suggestedUser)}
                disabled={connectingTo === suggestedUser.uid || pendingRequests.has(suggestedUser.uid)}
              >
                {pendingRequests.has(suggestedUser.uid) ? "Pending" : connectingTo === suggestedUser.uid ? "Connecting..." : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}