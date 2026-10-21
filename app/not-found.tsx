import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-md text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold">404 - Route Not Found</h2>
        <p className="text-slate-400 text-sm mt-2">
          The requested compliance route does not exist in the zkRegulate institutional ledger.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer"
        >
          Return to Protocol Command Center
        </Link>
      </div>
    </div>
  );
}
