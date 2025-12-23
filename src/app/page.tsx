"use client";

import React from "react";
import { Board } from "@/components/Board";

export default function ShelteredDaughter() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans select-none">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          箱入り娘(大家族)
        </h1>
        <p className="text-gray-600">「娘だけ」を玄関から出してね！</p>
      </header>

      {/* Game Board Container */}
      <Board />

      {/* Footer */}
      <footer className="mt-8 mb-4 text-lg text-center text-gray-800">
        <div className="mb-2">
          <span>Developed by </span>
          <a
            href="https://hakamata-soft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-medium"
          >
            HakamataSoft
          </a>
        </div>

        <div className="flex text-xs items-center justify-center gap-2">
          <span className="text-gray-800">Powered by</span>
          {/* Next.js Brand Color */}
          <span className="bg-black text-white px-2 py-0.5 rounded font-bold">
            Next.js
          </span>
          <span className="text-gray-800">&</span>
          {/* Tailwind CSS Brand Color */}
          <span className="bg-cyan-500 text-white px-2 py-0.5 rounded font-bold">
            Tailwind CSS
          </span>
        </div>
      </footer>
    </div>
  );
}
