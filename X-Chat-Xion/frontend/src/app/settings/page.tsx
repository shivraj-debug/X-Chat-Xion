"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowLeft, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCookie, hasCookie } from "cookies-next" // Import cookie utilities
// import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import {ModeToggle} from "@/components/ThemeProvider"

export default function Settings() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [chatbotName, setChatbotName] = useState("AI Assistant")
  const [themes, setThemes] = useState("blue")
  const [model, setModel] = useState("gpt-4")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  // const { theme, setTheme } = useTheme()

  const api=process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Check for token in cookies instead of localStorage
    const hasToken = hasCookie("token");
    if (!hasCookie) {
      router.push("/login")
      return
    }

    // Fetch user data using the token from cookies
    const fetchUserData = async () => {
      const address = localStorage.getItem("address")
      try {
        const res=await fetch(`${api}/api/user`, {
          method: "POST",  
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address })

        })

        if (!res.ok) {  throw new Error("Failed to fetch user data") }
        const data = await res.json()

        console.log(data)
        setName(data.name)
        setEmail(data.email)
        setChatbotName("AI Assistant")
        setThemes("blue")
        setModel("gpt-4")
      } catch (err) {
        setError("Failed to load user settings")
        console.error(err)
      }
    }

    fetchUserData()
  }, [router])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Authentication token missing")
      }

      // Example API call to update settings (commented out):
      // const response = await fetch("/api/settings", {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     name,
      //     darkMode,
      //     chatbotName,
      //     theme,
      //     model
      //   })
      // })
      
      // if (!response.ok) {
      //   const errorData = await response.json()
      //   throw new Error(errorData.message || "Failed to update settings")
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess("Settings updated successfully")
    } catch (err: any) {
      setError(err.message || "An error occurred while updating settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-4">
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md cursor-pointer">
            <TabsTrigger value="account" className="cursor-pointer text-lg">Account</TabsTrigger>
            <TabsTrigger value="appearance"  className="cursor-pointer text-lg">Appearance</TabsTrigger>
            <TabsTrigger value="ai"  className="cursor-pointer text-lg">AI Settings</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50  text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>{(name || "Jyoti")?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-medium">{name}</h3>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                <Separator />
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>

          </TabsContent>
           <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex  justify-between">    
                <div>
                  theme mode
                </div>
               <ModeToggle/>
                {/* <div className="space-y-2">
                  <Label htmlFor="theme">Theme Color</Label>
                  <Select value={themes} onValueChange={setThemes}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>Configure your AI assistant preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chatbotName">AI Assistant Name</Label>
                  <Input id="chatbotName" value={chatbotName} onChange={(e) => setChatbotName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    GPT-4 provides more accurate and nuanced responses but may be slower.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}