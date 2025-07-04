"use client"

import type { User } from "@/types"
import { useMemo } from "react"

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function useFormCompletion(profile: Partial<User>) {
  return useMemo(() => {
    const fields = {
      bio: {
        weight: 15,
        isComplete: () => !!profile.bio && profile.bio.length >= 50,
      },
      experience: {
        weight: 15,
        isComplete: () => !!profile.experience,
      },

      skills: {
        weight: 25,
        isComplete: () => !!(profile.skills && profile.skills.length >= 2),
      },

      academic: {
        weight: 15,
        isComplete: () => !!profile.branch && !!profile.year,
      },

      resume: {
        weight: 10,
        isComplete: () => !!profile.resume,
      },
      socialLinks: {
        weight: 10,
        isComplete: () => {
          const hasGithub = profile.githubUrl && isValidUrl(profile.githubUrl)
          const hasLinkedIn = profile.linkedinUrl && isValidUrl(profile.linkedinUrl)
          return hasGithub || hasLinkedIn
        },
      },

      achievements: {
        weight: 5,
        isComplete: () => !!(profile.achievements && profile.achievements.length > 0),
      },
      certificates: {
        weight: 5,
        isComplete: () => !!(profile.certificates && profile.certificates.length > 0),
      },
    }

    let progress = 0

    Object.values(fields).forEach((field) => {
      if (field.isComplete()) {
        progress += field.weight
      }
    })

    return Math.min(Math.round(progress), 100)
  }, [profile])
}

