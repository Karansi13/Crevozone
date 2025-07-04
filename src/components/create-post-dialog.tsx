"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "./ui/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Image, Video, Loader2, X } from "lucide-react"
import type { PostFormData, PostMedia } from "../types/index"
import { Timestamp } from "firebase/firestore"

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [media, setMedia] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleMediaUpload = async (files: File[]) => {
    const uploadedMedia: PostMedia[] = []

    for (const file of files) {
      const fileRef = ref(storage, `posts/${user?.uid}/${Date.now()}-${file.name}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)

      uploadedMedia.push({
        id: Timestamp.now().toString(),
        url,
        type: file.type.startsWith("image/") ? "image" : "video",
        // thumbnailUrl: file.type.startsWith("video/") ? null : undefined, // Fix for video files
      })
    }

    return uploadedMedia
  }

  const handleSubmit = async () => {
    if (!user || !content.trim()) return

    setIsSubmitting(true)

    try {
      const uploadedMedia = await handleMediaUpload(media)

      const postData = {
        authorId: user?.uid || "unknown_user", 
        author: {
          uid: user?.uid || "unknown_user",
          displayName: user?.displayName || "Anonymous", 
          photoURL: user?.photoURL || "/default-avatar.jpg", 
        },
        content: content.trim(),
        media: uploadedMedia,
        hashtags: content.match(/#[\w-]+/g) || [], 
        likes: [],
        comments: [],
        shares: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      // Log the post data for debugging
      // console.log("Post data to be submitted:", postData)

      // Check if any required fields are undefined
      for (const [key, value] of Object.entries(postData)) {
        if (value === undefined || value === null) {
          console.error(`Invalid value for field ${key}:`, value)
        }
      }

      // Check for missing required fields
      if (
        !postData.content ||
        !postData.authorId ||
        !postData.author ||
        !postData.author.uid ||
        !postData.author.displayName
      ) {
        throw new Error("Missing required fields")
      }

      await addDoc(collection(db, "posts"), postData)

      setContent("")
      setMedia([])
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[60vh] p-0 sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto bg-white border-none m-4 sm:m-0">
        <div className="p-4 border-b ">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user?.photoURL || "/default-avatar.jpg"} />
              <AvatarFallback>{user?.displayName?.[0] || "A"}</AvatarFallback> {/* Fallback if user.displayName is undefined */}
            </Avatar>
            <span className="font-semibold">{user?.displayName || "Anonymous"}</span> {/* Fallback if user.displayName is undefined */}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <textarea
            ref={textareaRef}
            placeholder="What do you want to share?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              adjustTextareaHeight()
            }}
            className="w-full resize-none outline-none min-h-[120px] placeholder:text-gray-500"
          />

          <AnimatePresence>
            {media.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-2"
              >
                {media.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="relative aspect-video"
                  >
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setMedia(media.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => document.getElementById("media-upload")?.click()}>
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => document.getElementById("video-upload")?.click()}>
                <Video className="w-5 h-5" />
              </Button>
            </div>

            <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting} className="px-8">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </Button>
          </div>

          <input
            id="media-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setMedia([...media, ...Array.from(e.target.files)])
              }
            }}
          />

          <input
            id="video-upload"
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setMedia([...media, ...Array.from(e.target.files)])
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
