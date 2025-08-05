import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Music2 } from "lucide-react"
import { setQuerySong } from "@/lib/actions"

export default function SearchForm() {


  return (
    <form action={setQuerySong} className="flex items-center gap-2">
      <Input
        required
        minLength={3}
        placeholder="Enter your Favourite Music"
        name="song-name"
      />
      <Button size={"sm"}>
        Find <Music2 />
      </Button>
    </form>
  )
}
