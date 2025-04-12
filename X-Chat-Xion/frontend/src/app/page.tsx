"use client";
import {
  Abstraxion,
  useAbstraxionAccount,
  useModal,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import { useRouter } from "next/navigation";
import { MessageSquare, History, Wallet, SunMoon, ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""


export default function WelcomeScreen() {
  const { client: signingClient } = useAbstraxionSigningClient()

  const { data } = useAbstraxionAccount();
  const router = useRouter();
  const [, setShow] = useModal();

  const api=process.env.NEXT_PUBLIC_API_URL;

  const registerUserOnXion = async (address: string) => {
    try {
      const msg = { register_user: {} }

      const res = await signingClient?.execute(address, contractAddress, msg, "auto")
      
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || ""

      if (message.includes("User Already Exists")) {
        console.warn("User already exists, skipping registration.")
        return
      }

      throw err
    }
  }


  const registerUser = async (bech32Address: string) => {

    const address = data?.bech32Address
    if (!address) {
      alert("Please connect your wallet");
      return
    }

    try {
      await registerUserOnXion(address)

      const response = await fetch(`${api}/api/user/checkUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: bech32Address }),
      });

      const data = await response.json();
      localStorage.setItem("address", bech32Address);
      router.push(data.success ? "/chat" : "/signup");
    } catch (error) {
      console.error("Network or server error:", error);
    }
  };



  return (
    <div className="relative max-w-screen bg-[url('/X-chat-bg.png')] bg-cover bg-no-repeat bg-center min-h-screen">
      {/* Connect Wallet CTA */}
      <div className="absolute top-8 right-8 rounded-lg z-50 bg-white shadow-lg hover:scale-105 transition-all">
        <Button
          onClick={() => {
            if (data.bech32Address) {
              registerUser(data.bech32Address);
            } else {
              setShow(true);
            }
          }}
          className="text-black text-lg px-6 py-3 cursor-pointer"
        >
          {data.bech32Address ? "VIEW ACCOUNT" : "GET STARTED WITH XION"}
        </Button>
        <Abstraxion onClose={() => setShow(false)} />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center backdrop-blur-sm bg-black/60">
        <div className="mb-6 rounded-full bg-primary/10 p-4">
          <MessageSquare className="h-14 w-14 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Welcome to X-Chat</h1>
        <p className="text-xl text-gray-300 max-w-2xl mb-10">
          Your intelligent AI assistant powered by cutting-edge language models and integrated with Xion blockchain for seamless transactions.
        </p>
        <Button
          onClick={() => {
            if (data.bech32Address) {
              registerUser(data.bech32Address);
            } else {
              setShow(true);
            }
          }}
          className="bg-white text-black font-semibold px-8 py-4 text-lg hover:scale-105 transition cursor-pointer"
        >
          {data.bech32Address ? "VIEW ACCOUNT" : "GET STARTED WITH XION"}
        </Button>
      </div>

      {/* Features Section */}
      <section className="bg-black/80 text-white py-20 px-6 md:px-30">
        <h2 className="text-4xl font-bold text-center mb-12">Features of X-Chat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
            <History className="w-10 h-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chat History</h3>
            <p>View, rename, or delete your previous AI conversations with ease.</p>
          </div>
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
            <Wallet className="w-10 h-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Points & Wallet</h3>
            <p>Track available points and transaction history in your Xion-powered wallet.</p>
          </div>
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
            <ShoppingCart className="w-10 h-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Buy Points</h3>
            <p>Purchase more points easily using Xion blockchain for a smooth experience.</p>
          </div>
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
            <SunMoon className="w-10 h-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Theme Toggle</h3>
            <p>Switch between light and dark modes with a single click.</p>
          </div>
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
            <MessageSquare className="w-10 h-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart AI Chat</h3>
            <p>Ask anything, anytime — get high-quality answers instantly.</p>
          </div>
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
            <Wallet className="w-10 h-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Blockchain Login</h3>
            <p>Log in securely using your Xion wallet — no password required.</p>
          </div>
        </div>
      </section>
      {/*Footer} */}
      <section className="footer bg-black/80 text-white py-20 px-6 md:px-20  ">
      <Footer />
      </section>
    </div>
  );
}
