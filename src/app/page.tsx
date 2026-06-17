"use client";

import { useState } from "react";
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      setMessage("Uploading...");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Upload successful");
        console.log(data);
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong");
    }
  };
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="p-5">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0];

              if (selected) {
                setFile(selected);
              }
            }}
          />

          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
          >
            Upload PDF
          </button>

          <p className="mt-3">{message}</p>
        </div>
      </main>
    </div>
  );
}
