"use client";
import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Twitter, Instagram } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  // Always shows current year — no hard-coded year
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1a2744] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white">CampusEvents</span>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Connecting students, faculty, and innovators through meaningful campus experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/events", label: "Upcoming Events" },
                { href: "/events", label: "Campus Map" },
                { href: "/events", label: "Student Societies" },
                { href: "/support", label: "Submit Event" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/support", label: "Help Center" },
                { href: "/support", label: "Terms of Service" },
                { href: "/support", label: "Privacy Policy" },
                { href: "/support", label: "Report Issue" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Subscribe</h4>
            <p className="text-sm text-gray-300 mb-4">Get the weekly campus digest.</p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-l-md text-white placeholder:text-gray-400 focus:outline-none focus:bg-white/15 min-w-0"
              />
              <button type="submit"
                className="px-4 py-2 bg-white text-sm font-semibold rounded-r-md hover:bg-gray-100 transition-colors shrink-0"
                style={{ color: '#1a2744' }}>
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            {/* Dynamic year — updates automatically every year */}
            © {year} University Campus Events Information System. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
