import { ModeToggle } from "@/components/DarkModeToggler";
import React, { Suspense } from "react";
import SearchResults from "@/components/SearchResults";
import { ThemeChanger } from "@/components/theme-changer";
import SearchForm from "./SearchForm";
import LoadingText from "./loaders/LoadingText";
import { generateRandomId } from "@/lib/utils";

const HomePage = async ({searchParams} : {searchParams : Promise<{search? : string}>}) => {
  const params = await searchParams
  const query = params.search
  return (
    <div className="w-screen h-dvh flex bg-secondary/40 items-center justify-center">
      <div className="p-4 flex flex-col bg-background shadow-md max-w-6xl w-full max-sm:h-full max-sm:w-full h-[93%] rounded-lg">
        <div className="flex items-center justify-between pb-4">
          <p className="text-xs">
            <span className="font-bold text-primary rounded-md text-xl">
              AudioVibes
            </span>{" "}
            by Cygnuxxs
          </p>
          <div className="flex gap-2">
            <ThemeChanger />
            <ModeToggle />
          </div>
        </div>
        <SearchForm />
        <div className="overflow-auto items-start justify-center h-full flex w-full gap-4 flex-wrap mt-4">
          <Suspense key={generateRandomId(4)} fallback = {<LoadingText />}>
            <SearchResults query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
