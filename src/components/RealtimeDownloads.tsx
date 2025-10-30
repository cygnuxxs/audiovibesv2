"use client";

import * as React from "react";
import NumberFlow from "@number-flow/react";
import { supabase } from "@/lib/supabase";
import { DownloadIcon } from "lucide-react";

export default function RealtimeDownloads() {
  const [downloads, setDownloads] = React.useState(0);

  React.useEffect(() => {
    // Fetch initial count
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from("downloads")
          .select("count")
          .limit(1)
          .maybeSingle(); // safer than .single()

        if (error) {
          console.error("Error fetching downloads:", error.message);
          return;
        }

        if (data?.count !== undefined) {
          setDownloads(data.count);
        }
      } catch (err) {
        console.error("Failed to fetch initial count:", err);
      }
    };

    fetchInitial();

    // Set up realtime subscription
    const channel = supabase
      .channel("downloads-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "downloads" },
        (payload) => {
          if (payload.new?.count !== undefined) {
            setDownloads(payload.new.count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center text-xs gap-2 w-full mx-auto">
      <NumberFlow
        value={downloads}
        locales="en-US"
        trend={() => 1}
        transformTiming={{
          duration: 500,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        animated
        className="tabular-nums font-semibold tracking-tight text-primary truncate"
      />
      <span className="text-primary items-end truncate"><DownloadIcon size={14} /></span>
    </div>
  );
}
