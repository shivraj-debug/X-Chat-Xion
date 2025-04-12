import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black/90 text-white py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3  text-center gap-8">
        {/* Logo & About */}
        <div>
          <div className="flex items-center mb-4">
            <MessageSquare className="h-6 w-6 mr-2 text-primary" />
            <span className="text-xl font-bold">X-Chat</span>
          </div>
          <p className="text-gray-400 -ml-4">
            Your personal AI assistant integrated with Xion blockchain for secure, smart, and scalable experiences.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-2 text-gray-300">
            <li>
              <Link href="/chat" className="hover:text-white">Chat</Link>
            </li>
            <li>
              <Link href="/history" className="hover:text-white">History</Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-white">Account</Link>
            </li>
            <li>
              <Link href="/buy-points" className="hover:text-white">Buy Points</Link>
            </li>
          </ul>
        </div>

        {/* Contact or Blockchain Info */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Powered by</h3>
          <p className="text-gray-400 mb-2">Xion Blockchain</p>
          <a
            href="https://xion.burnt.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Learn more
          </a>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} X-Chat. All rights reserved.
      </div>
    </footer>
  );
}
