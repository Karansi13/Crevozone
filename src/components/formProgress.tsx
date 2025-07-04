"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FormProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function FormProgress({ progress, size = 200, strokeWidth = 8, className }: FormProgressProps) {
  const center = size / 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (progress / 100) * circumference

  const getTextColor = (progress: number) => {
    if (progress < 40) return "text-red-500"
    if (progress < 70) return "text-yellow-500"
    return "text-emerald-500"
  }

  const getStrokeColor = (progress: number) => {
    if (progress < 40) return "stroke-red-500"
    if (progress < 70) return "stroke-yellow-500"
    return "stroke-emerald-500"
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full blur-2xl opacity-15",
            getTextColor(progress).replace("text-", "bg-")
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 1 }}
        />

        <svg width={size} height={size} className="rotate-[-90deg] relative z-10">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className={cn(getStrokeColor(progress), "opacity-20")}
            strokeWidth={strokeWidth}
          />

          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className={getStrokeColor(progress)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{
              type: "spring",
              stiffness: 25,
              damping: 12,
              mass: 1,
            }}
          />

          <circle
            cx={center}
            cy={center}
            r={radius + strokeWidth}
            fill="none"
            className={cn(getStrokeColor(progress), "opacity-20")}
            strokeWidth={2}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center"
          >
            <motion.span
              className={cn("text-sm md:text-2xl mt-2 font-bold", getTextColor(progress))}
              key={progress}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {progress}%
            </motion.span>
            <motion.div
              className="flex gap-1.5 mt-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    progress >= (i + 1) * 33.33
                      ? getTextColor(progress).replace("text-", "bg-")
                      : "bg-gray-200"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.p
        className="text-xl text-gray-600 font-normal"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {progress < 100 ? "Complete your profile..." : "Your Profile is Completed!!"}
      </motion.p>
    </div>
  )
}