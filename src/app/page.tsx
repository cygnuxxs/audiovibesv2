import { ModeToggle } from "@/components/DarkModeToggler";
import React from "react";
import { ThemeChanger } from "@/components/theme-changer";
import SearchForm from "./SearchForm";
import SearchResults from "@/components/SearchResults";

const HomePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const query = (await searchParams).q;

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
          <SearchResults query={query} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
