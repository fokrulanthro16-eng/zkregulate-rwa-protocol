"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-slate-950 text-white flex items-center justify-center min-h-screen">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold">Protocol Exception Encountered</h2>
          <p className="text-sm text-slate-400 mt-2">{error.message || "An unexpected error occurred."}</p>
          <button
            onClick={() => reset()}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition cursor-pointer"
          >
            Reset State
          </button>
        </div>
      </body>
    </html>
  );
}
