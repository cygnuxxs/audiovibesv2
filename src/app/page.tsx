import { ModeToggle } from "@/components/DarkModeToggler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSongName } from "@/lib/actions";
import { Music2 } from "lucide-react";
import React, { Suspense } from "react";
import { cookies } from "next/headers";
import LoadingText from "./loaders/LoadingText";
import SearchResults from "@/components/SearchResults";

const page = async () => {
  const cookieStore = await cookies();
  const id = cookieStore.get("id");
  return (
    <div className="w-screen h-dvh flex items-center justify-center">
      <div className="p-4 flex flex-col bg-primary-foreground shadow-md max-w-6xl w-full max-sm:h-full max-sm:w-full h-[93%] rounded-lg">
        <div className="flex items-center justify-between pb-4">
          <p className="text-xs">
            <span className="font-bold text-primary rounded-md text-xl">
              AudioVibes
            </span>{" "}
            by Cygnuxxs
          </p>
          <ModeToggle />
        </div>
        <form action={saveSongName} className="flex items-center gap-2">
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
          <div className="overflow-y-auto items-center justify-center h-full flex w-full gap-4 flex-wrap mt-4">
        <Suspense key={id?.value} fallback={<LoadingText />}>
            <SearchResults />
        </Suspense>
          </div>
      </div>
    </div>
  );
};

export default page;
