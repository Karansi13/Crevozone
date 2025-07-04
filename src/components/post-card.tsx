import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Heart, MessageCircle, MoreVertical, Share2, Trash2 } from "lucide-react";
import type { Post, Comment } from "@/types";
import { Timestamp } from "firebase/firestore";
import { ImageGallery } from "@/components/ImageGallery";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.uid || ""));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false); // Track if the post is deleted

  useEffect(() => {
    const postRef = doc(db, "posts", post.id);
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedPost = snapshot.data() as Post;
        setLikeCount(updatedPost.likes.length);
        setIsLiked(updatedPost.likes.includes(user?.uid || ""));
        setComments(updatedPost.comments);
      } else {
        // If the post no longer exists, mark it as deleted
        setIsDeleted(true);
        setShowOptions(false); // Reset showOptions when the post is deleted
      }
    });
    return () => unsubscribe();
  }, [post.id, user?.uid]);

    const handleLike = async () => {
    if (!user) return

    const postRef = doc(db, "posts", post.id)
    const newIsLiked = !isLiked

    try {
      await updateDoc(postRef, {
        likes: newIsLiked ? arrayUnion(user.uid) : arrayRemove(user.uid),
      })
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return

    const postRef = doc(db, "posts", post.id)

    const commentData = {
      id: crypto.randomUUID(), // Unique comment ID
      postId: post.id,
      authorId: user.uid,
      author: {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      content: commentText,
      likes: [],
      replies: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    try {
      await updateDoc(postRef, {
        comments: arrayUnion(commentData),
      })

      setCommentText("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    const postRef = doc(db, "posts", post.id)
    try {
      const updatedComments = comments.filter((comment) => comment.id !== commentId)
      await updateDoc(postRef, { comments: updatedComments })
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!postId) {
      console.error("Post ID is missing.");
      return;
    }


    try {
      if (post.media && post.media.length > 0) {
        for (const mediaItem of post.media) {
          try {
            const fileRef = ref(storage, mediaItem.url); 
            await deleteObject(fileRef); 
            // console.log(`Deleted media: ${mediaItem.url}`);
          } catch (storageError) {
            console.error("Error deleting media:", storageError);
          }
        }
      }

      const postRef = doc(db, "posts", postId);
      await deleteDoc(postRef);

      // console.log("Post and associated media deleted successfully");
      toast.success("Post deleted successfully");
      setShowOptions(false); // Ensure options are hidden after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // If the post is deleted, don't render anything
  if (isDeleted) {
    return null;
  }
  function formatDate(timestamp?: { seconds: number; nanoseconds: number }) {
    if (!timestamp || !timestamp.seconds) return "Just now"; // Handle missing timestamps

    const date = new Date(timestamp.seconds * 1000); // Convert Firestore seconds to JS Date
    const now = new Date();
    const diffInSeconds = Math.max(1, Math.floor((now.getTime() - date.getTime()) / 1000)); // Ensure at least 1 sec

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;

    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-xl w-full mx-auto"
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/profile/${post.author.erpId}`)}>
          <AvatarImage src={post.author.photoURL} />
          <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${post.author.erpId}`)}>
          <h3 className="font-semibold text-sm truncate">{post.author.displayName}</h3>
          <p className="text-xs text-gray-500">
            {formatDate(post.createdAt as Timestamp | { seconds: number; nanoseconds: number })}
          </p>
        </div>
        {user?.uid === post.author.uid && (
          <div className="relative">
            <button
              className="text-gray-600 hover:bg-gray-200 p-2 rounded-full"
              onClick={() => setShowOptions(!showOptions)}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md p-1 w-[8rem] text-[14px]">
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-500 hover:bg-gray-100 p-1 w-full text-left"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" /> Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 py-2">
          <p className="text-sm text-gray-700">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.media.length > 0 && (
        <div className="mt-2">
          <ImageGallery media={post.media} />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 hover:bg-gray-100 ${isLiked ? "text-red-500" : ""}`}
            onClick={handleLike}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-100">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{comments.length}</span>
          </Button>
        </div>

        {/* Comment Input */}
        <div className="flex items-center gap-2 py-2 border-t">
          <input
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button
            onClick={handleAddComment}
            size="sm"
            variant="ghost"
            className="font-semibold text-primary hover:bg-primary/10"
            disabled={!commentText.trim()}
          >
            Post
          </Button>
        </div>

        {/* Comments */}
        {comments.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            {comments
              .slice(0, showAllComments ? comments.length : 1)
              .map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar className="w-6 h-6 cursor-pointer" onClick={() => navigate(`/profile/${comment.author.erpId}`)}>
                    <AvatarImage src={comment.author.photoURL} />
                    <AvatarFallback>{comment.author.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">
                        <span className="font-semibold cursor-pointer" onClick={() => navigate(`/profile/${comment.author.erpId}`)}>{comment.author.displayName}</span>{" "}
                        <span className="text-gray-700">{comment.content}</span>
                      </p>
                      {user?.uid === comment.authorId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(comment.createdAt as Timestamp | { seconds: number; nanoseconds: number })}
                    </p>
                  </div>
                </div>
              ))}
            {comments.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}