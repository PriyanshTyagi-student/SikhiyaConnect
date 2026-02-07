"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAPIURLOverride, clearAPIURLOverride, getAPIURL } from "@/lib/api";

export default function ServerSettingsPage() {
  const [url, setUrl] = useState<string>(getAPIURL());
  const [message, setMessage] = useState<string>("");

  const save = () => {
    setAPIURLOverride(url.trim());
    setMessage(`Saved: ${getAPIURL()}`);
  };

  const reset = () => {
    clearAPIURLOverride();
    setUrl(getAPIURL());
    setMessage(`Reset to default: ${getAPIURL()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Server Settings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Set the API base URL at runtime.
        </p>

        <div className="mt-4 space-y-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">API URL</label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-backend.example.com" />
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={save}>Save</Button>
          <Button variant="outline" onClick={reset}>Reset</Button>
        </div>

        {message && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{message}</p>
        )}

        <div className="mt-6">
          <Link href="/">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
