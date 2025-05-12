import React from "react";

export default function Footer() {
  return (
    <footer className="py-4 px-6 text-center text-sm text-gray-500 border-t bg-white">
      <div className="max-w-7xl mx-auto">
        <p>
          &copy; {new Date().getFullYear()} Trading Card Market | 
          Created by <span className="font-semibold">Jeremy Bosch</span>
        </p>
      </div>
    </footer>
  );
}