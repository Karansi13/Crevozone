import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

