"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from "react-hot-toast";
import { useAbstraxionSigningClient } from "@burnt-labs/abstraxion";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const api=process.env.NEXT_PUBLIC_API_URL;


  const { client: signingClient } = useAbstraxionSigningClient();

  const registerUserOnBlockChain = async () => {
    try {
      const msg = {
        register_user: {},
      };
      if (signingClient) {
        const res = await signingClient.execute(
          localStorage.getItem("address") || "",
          contractAddress,
          msg,
          "auto"
        );

        console.log("res", res);
      }
    } catch (err: any) {
      const message = err?.message || "";

      if (message.includes("User Already Exists")) {
        console.warn("User already exists, skipping registration.");
        return;
      }

      console.error("Unexpected error:", err);
      throw err;
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const address= localStorage.getItem("address")
    try {
      const response = await fetch(`${api}/api/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email,address }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }


      await registerUserOnBlockChain();
      
      // Redirect to login page
      router.push("/chat")
    } catch (err: any) {
      setError(err.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-md animate-fade-up">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Hello!</CardTitle>
          <CardDescription>We would like to know your name and email... </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="shiv" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full shadow-sm" disabled={loading}>
              {loading ? "Please Wait..." : "Let's Start"}
            </Button>
          </form>
        </CardContent>

      </Card>
    </div>
  )
}

