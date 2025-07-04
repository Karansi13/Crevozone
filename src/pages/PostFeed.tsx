"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { PostCard } from "@/components/post-card"
import { PostSkeleton } from "@/components/post-skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Post } from "@/types"
import { SuggestedUsers } from "@/components/suggested-users"


const POSTS_PER_PAGE = 10 // new

export default function FeedPage() {
  const { user } = useAuth()
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(true)



  const fetchPosts = useCallback((startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    const postsRef = collection(db, "posts");
    const q = startAfterDoc
      ? query(postsRef, orderBy("createdAt", "desc"), startAfter(startAfterDoc), limit(POSTS_PER_PAGE))
      : query(postsRef, orderBy("createdAt", "desc"), limit(POSTS_PER_PAGE));
  
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newPosts = snapshot.docs.map((doc) => {
          const data = doc.data();
          
          return {
            id: doc.id,
            ...data,
            // Don't overwrite the original createdAt field; use it as-is
            createdAt: data.createdAt, // Firestore timestamp
            updatedAt: data.updatedAt, // Firestore timestamp
          };
        }) as Post[];
  
        setPosts((prevPosts) => {
          if (startAfterDoc) {
            return [...prevPosts, ...newPosts];
          }
          // Merge new posts with existing ones while avoiding duplicates
          const existingIds = new Set(prevPosts.map((p) => p.id));
          const uniqueNewPosts = newPosts.filter((p) => !existingIds.has(p.id));
          return [...uniqueNewPosts, ...prevPosts];
        });
  
        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching posts: ", error);
        setLoading(false);
      }
    );
  
    return unsubscribe;
  }, []);
  
  
  useEffect(() => {
    const unsubscribe = fetchPosts()
    return () => unsubscribe()
  }, [fetchPosts])

  const loadMore = () => {
    if (lastVisible) {
      fetchPosts(lastVisible)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center gap-4 px-4 md:px-0 my-[5rem]">
        
  

        {/* Main Content */}
        <main className="py-4 space-y-6 w-full md:w-[50rem]">
          {user && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex gap-4 items-center">
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="w-full justify-start text-gray-500"
                  onClick={() => setIsPostDialogOpen(true)}
                >
                  What's on your mind?
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {hasMore && !loading && (
            <div className="flex justify-center">
              <Button onClick={loadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </main>

        {/* Right Sidebar (Hidden on Mobile, Visible on Large Screens) */}
        <div className="hidden lg:block sticky top-0 h-screen p-4 md:h-auto md:p-2">
          <SuggestedUsers />
        </div>
      </div>

      <CreatePostDialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen} />
    </div>
  );
}

