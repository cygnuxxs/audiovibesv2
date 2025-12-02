import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const SongCardSkeleton = () => {
  return (
    <div className="group relative flex flex-1 min-w-100 items-center gap-3 p-3 rounded-xl overflow-hidden">
      {/* Content wrapper with relative positioning */}
      <div className="relative flex items-center gap-3 w-full">
        {/* Image skeleton */}
        <Skeleton className="w-[200px] h-[200px] max-sm:w-32 max-sm:h-32 shrink-0 rounded-md" />
        
        {/* Content skeleton */}
        <div className="flex flex-col gap-2 w-full">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-3/4 max-w-[300px]" />
          
          {/* Album link skeleton */}
          <Skeleton className="h-4 w-1/2 max-w-[200px]" />
          
          {/* Artist section skeleton */}
          <div className="flex gap-2 items-center">
            <Skeleton className="w-[25px] h-[25px] rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Metadata skeleton (duration, play count, year) */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          
          {/* PlayCard button skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

const SongCardListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SongCardSkeleton key={index} />
      ))}
    </div>
  )
}

export default SongCardListSkeleton
export { SongCardSkeleton }