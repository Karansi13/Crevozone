import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { Button } from './ui/Button';
import { TeamRequest, PostNotification, Post } from '@/types'; // Assuming Post type is defined
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<TeamRequest[]>([]);
  const [postNotifications, setPostNotifications] = useState<PostNotification[]>([]);
  const [posts, setPosts] = useState<Post[]>([]); // New state for posts
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch pending requests
    const requestsRef = collection(db, 'teamRequests');
    const pendingQuery = query(
      requestsRef,
      where('receiverId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const newRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamRequest));
      setRequests(newRequests);
    });

    // Fetch post notifications
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(
      notificationsRef,
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date() // Ensure it's a Date
        } as PostNotification;
      });
      setPostNotifications(newNotifications);
    });

    // Fetch accepted requests
    const acceptedQuery = query(
      requestsRef,
      where('senderId', '==', user.uid),
      where('status', '==', 'accepted')
    );

    const unsubscribeAccepted = onSnapshot(acceptedQuery, (snapshot) => {
      const newAcceptedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamRequest));
      setAcceptedRequests(newAcceptedRequests);
    });

    // Fetch posts data
    const postsRef = collection(db, 'posts');
    const postsQuery = query(
      postsRef,
      where('likes', 'array-contains', user.uid) // If user liked the post
    );

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Ensure it's a Date
        } as Post; // Make sure you define the Post type correctly
      });
      setPosts(newPosts);
    });

    return () => {
      unsubscribePending();
      unsubscribeNotifications();
      unsubscribeAccepted();
      unsubscribePosts(); // Cleanup for post data
    };
  }, [user]);

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const requestRef = doc(db, 'teamRequests', requestId);
      await updateDoc(requestRef, { status });
      setShowDropdown(false);
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      setPostNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationContent = (notification: PostNotification) => {
    switch (notification.type) {
      case 'like':
        return `liked your post "${notification.postTitle}"`;
      case 'comment':
        return `commented on your post: "${notification.commentText}"`;
      default:
        return 'interacted with your post';
    }
  };

  const totalUnread = requests.length + postNotifications.length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
          {/* Post Notifications */}
          {postNotifications.length > 0 && (
            <div className="border-b border-gray-200 px-4 py-2">
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              {postNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="px-4 py-2 hover:bg-gray-50 mt-2"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-center space-x-3">
                    {notification.senderPhoto ? (
                      <img
                        src={notification.senderPhoto}
                        alt={notification.senderName}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {notification.senderName[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{notification.senderName}</span>
                        {' '}
                        {getNotificationContent(notification)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Posts with Likes and Comments */}
          {posts.length > 0 && (
            <div className="border-b border-gray-200 px-4 py-2">
              <p className="text-sm font-medium text-gray-600">Recent Posts</p>
              {posts.map((post) => (
                <div key={post.id} className="px-4 py-2 hover:bg-gray-50 mt-2">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.photoURL}
                      alt={post.displayName}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{post.displayName}</p>
                      <p className="text-xs text-gray-500">{post.content}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                      </p>
                      <p className="text-sm text-gray-600">Likes: {post.likes.length}</p>
                      <p className="text-sm text-gray-600">Comments: {post.comments.length}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Accepted Requests Notifications */}
          {acceptedRequests.length > 0 && (
            <div className="border-b border-gray-200 px-4 py-2">
              <p className="text-sm font-medium text-gray-600">Accepted Requests</p>
              {acceptedRequests.map((request) => (
                <div key={request.id} className="px-4 py-2 text-sm text-green-700 bg-green-100 rounded-md mt-2">
                  🎉 {request.receiverName || "Unknown"} accepted your request!
                </div>
              ))}
            </div>
          )}

          {/* Pending Requests */}
          {requests.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-gray-600 px-4 py-2">Team Requests</p>
              {requests.map((request) => (
                <div key={request.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center space-x-3 mb-2">
                    {request.senderPhoto ? (
                      <img
                        src={request.senderPhoto}
                        alt={request.senderName || "Unknown User"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {request.senderName?.[0] || "U"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{request.senderName || "Unknown User"}</p>
                      <p className="text-sm text-gray-500">wants to connect</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleRequest(request.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleRequest(request.id, 'rejected')}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {totalUnread === 0 && (
            <p className="text-sm text-gray-500 px-4 py-2">No new notifications</p>
          )}
        </div>
      )}
    </div>
  );
}
