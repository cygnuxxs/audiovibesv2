import MusicSpectrumLoader from "@/app/loaders/Spinner";
export default function Loading() {
  return (
    <div className="w-screen h-dvh flex bg-secondary/40 items-center justify-center">
      <main className="p-4 flex flex-col bg-background shadow-md max-w-6xl w-full max-sm:h-full max-sm:w-full h-[93%] rounded-lg items-center justify-center">
        <MusicSpectrumLoader size="lg" />
      </main>
    </div>
  );
}
