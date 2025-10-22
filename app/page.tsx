"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";

export default function AnagramFinder() {
  const { data: session, status } = useSession();

  const [anagramSearch, setAnagramSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [anagramResults, setAnagramResults] = useState<string[]>([]);

  useEffect(() => {
    if (anagramSearch) {
      const controller = new AbortController();
      const signal = controller.signal;

      const handler = setTimeout(async () => {
        try {
          const res = await fetch(`/api/anagrams?search=${anagramSearch}`, {
            signal,
          });

          const data = await res.json();

          setAnagramResults(data.anagrams);
        } catch (err) {
          // log the error if it's not an abort error
          if (err instanceof Error && err.name !== "AbortError") {
            console.error(err);
          }
        } finally {
          // we only want the non-aborted requests to update loading state
          if (!signal.aborted) setLoading(false);
        }
      }, 400);

      return () => {
        clearTimeout(handler);
        controller.abort();
      };
    }
  }, [anagramSearch]);

  const updateAnagramSearch = (input: string) => {
    setAnagramSearch(input);

    if (input) {
      setLoading(true);
    } else {
      setLoading(false);
      setAnagramResults([]);
    }
  };

  if (status === "loading")
    return <div className="bg-blue-400 h-screen w-screen"></div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center bg-blue-400 h-screen w-screen">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold text-white">Welcome back!</h3>
          <h5 className="text-base font-medium text-white/70 mb-2">
            Please sign in with Google to access the Anagram Finder
          </h5>
          <button
            className="flex items-center justify-center gap-2 bg-white text-gray-700 font-medium px-4 py-2 rounded shadow hover:bg-gray-100 transition"
            onClick={() => signIn("google")}
          >
            <Image
              src="https://static.vecteezy.com/system/resources/previews/046/861/647/non_2x/google-logo-transparent-background-free-png.png"
              alt="Google logo"
              width={24}
              height={24}
            />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-blue-400 h-screen w-screen">
      <div className="flex flex-row justify-end w-full p-4">
        <button
          className="flex items-center justify-center gap-2 bg-white text-gray-700 font-medium px-4 py-2 rounded shadow hover:bg-gray-100 transition"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center mb-16">
        <div className="flex flex-col items-center h-fit w-fit gap-2">
          <h3 className="text-2xl font-bold text-white mb-2">Anagram Finder</h3>
          <div className="flex flex-col w-96 p-4 rounded-md bg-blue-500 border border-blue-600">
            <div className="relative flex flex-row border-2 border-white/10 rounded-md bg-white/10 w-full">
              <FiSearch
                className="absolute top-0 bottom-0.5 left-2 m-auto text-white/80"
                size={17}
              />
              <input
                type="text"
                value={anagramSearch}
                onChange={(e) => updateAnagramSearch(e.target.value)}
                className="text-white text-base font-medium w-full p-1 pl-9 pr-2 h-10"
                placeholder="Enter your letters..."
                aria-label="Enter letters to find anagrams"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-42 gap-1">
                <AiOutlineLoading
                  className="text-white animate-spin"
                  size={17}
                />
              </div>
            ) : anagramResults.length > 0 ? (
              <div className="flex flex-col items-start justify-start min-h-42 p-2 py-3 gap-1">
                <div className="p-1">
                  <h6 className="text-sm text-white font-light">
                    {anagramResults.length} Matches Found
                  </h6>
                </div>
                <hr className="w-full border-t border-white/30" />
                <div className="flex flex-col p-1 gap-1 w-full overflow-y-auto max-h-60">
                  {anagramResults.map((anagram, index) => (
                    <h6 key={index} className="text-sm text-white font-light">
                      {anagram}
                    </h6>
                  ))}
                </div>
              </div>
            ) : anagramSearch ? (
              <div className="flex flex-col items-center justify-center h-42 gap-1">
                <h5 className="text-base text-white font-bold">No Matches!</h5>
                <h6 className="text-sm text-white font-light">
                  There are no anagrams for this group of letters.
                </h6>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
