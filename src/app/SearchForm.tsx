'use client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Music2 } from "lucide-react"
import { useRouter, useSearchParams } from 'next/navigation'


export default function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get('q') || ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const songName = formData.get("song-name") as string
    if (songName.length < 3) return
    router.push(`/?q=${encodeURIComponent(songName)}`)
  }
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        required
        minLength={3}
        placeholder="Enter your Favourite Music"
        name="song-name"
        defaultValue={currentQuery}
      />
      <Button type="submit" size={"sm"}>
        Find <Music2 className="ml-2" />
      </Button>
    </form>
  )
}
