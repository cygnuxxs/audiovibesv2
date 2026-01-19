'use client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Music2, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'


export default function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get('q') || ''
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const songName = formData.get("song-name") as string
    if (songName.length < 3) return

    startTransition(() => {
      router.push(`/?q=${encodeURIComponent(songName)}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center backdrop-blur-xs gap-1 p-2 bg-card/20 rounded-full border border-border">
      <Input
        required
        minLength={3}
        placeholder="Enter your Favourite Music"
        name="song-name"
        defaultValue={currentQuery}
        disabled={isPending}
        aria-label="Enter your Favourite Music"
        className="rounded-full shadow-md border border-border bg-card"
      />
      <Button type="submit" size={"sm"} className="rounded-full shadow-lg shadow-primary/80" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Finding...
          </>
        ) : (
          <>
            Find <Music2 />
          </>
        )}
      </Button>
    </form>
  )
}
