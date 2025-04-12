"use client"

import { Switch } from "@/components/ui/switch"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {hasCookie, setCookie} from "cookies-next"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Users,
  MessageSquare,
  BarChart3,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Zap,
  Brain,
  Sparkles,
  ThumbsUp,
  CheckCircle,
  XCircle,
  Settings,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface userType{
  name:string,
  email:string,
  status:string,
  conversation:number,
  lastActive:string,
}
interface conversationType{
  sessionId:string,
  user:string,
  messages:number,
  duration:string,
  satisfaction:string,
  date:string,
}

// const mockConversations = [
//   { id: 1, user: "John Doe", messages: 15, duration: "12 min", satisfaction: "positive", date: "2023-03-19" },
//   { id: 2, user: "Jane Smith", messages: 8, duration: "5 min", satisfaction: "neutral", date: "2023-03-19" },
//   { id: 3, user: "Emily Davis", messages: 23, duration: "18 min", satisfaction: "positive", date: "2023-03-19" },
//   { id: 4, user: "Michael Wilson", messages: 12, duration: "9 min", satisfaction: "negative", date: "2023-03-18" },
//   { id: 5, user: "David Miller", messages: 19, duration: "14 min", satisfaction: "positive", date: "2023-03-18" },
//   { id: 6, user: "Lisa Anderson", messages: 7, duration: "4 min", satisfaction: "neutral", date: "2023-03-18" },
//   { id: 7, user: "John Doe", messages: 11, duration: "8 min", satisfaction: "positive", date: "2023-03-17" },
//   { id: 8, user: "Jane Smith", messages: 16, duration: "13 min", satisfaction: "negative", date: "2023-03-17" },
// ]

const mockFlaggedContent = [
  { id: 1, user: "Michael Wilson", content: "How can I hack into a website?", date: "2023-03-19", status: "pending" },
  {
    id: 2,
    user: "Anonymous",
    content: "Tell me how to make dangerous substances",
    date: "2023-03-18",
    status: "reviewed",
  },
  { id: 3, user: "David Miller", content: "Can you help me cheat on my exam?", date: "2023-03-18", status: "pending" },
  {
    id: 4,
    user: "Anonymous",
    content: "How to access someone else's account without permission",
    date: "2023-03-17",
    status: "pending",
  },
]

const userActivityData = [
  { name: "Mon", users: 120 },
  { name: "Tue", users: 150 },
  { name: "Wed", users: 180 },
  { name: "Thu", users: 170 },
  { name: "Fri", users: 200 },
  { name: "Sat", users: 160 },
  { name: "Sun", users: 140 },
]

const messageVolumeData = [
  { name: "Mon", user: 450, ai: 520 },
  { name: "Tue", user: 580, ai: 620 },
  { name: "Wed", user: 690, ai: 750 },
  { name: "Thu", user: 620, ai: 680 },
  { name: "Fri", user: 780, ai: 830 },
  { name: "Sat", user: 590, ai: 640 },
  { name: "Sun", user: 510, ai: 570 },
]

const COLORS = ["#4ade80", "#94a3b8", "#f87171"]

const aiPerformanceData = [
  { name: "Response Time", value: 1.2, unit: "s", change: -0.3, trend: "down" },
  { name: "Accuracy Rate", value: 94.5, unit: "%", change: 2.1, trend: "up" },
  { name: "Completion Rate", value: 97.8, unit: "%", change: 0.5, trend: "up" },
  { name: "Token Usage", value: 1250, unit: "avg", change: -50, trend: "down" },
]

const topQueriesData = [
  { query: "How to reset password", count: 78 },
  { query: "Account settings", count: 65 },
  { query: "Subscription plans", count: 52 },
  { query: "Payment methods", count: 48 },
  { query: "Technical support", count: 43 },
]

export default function AdminDashboard() {
  const [searchUser, setSearchUser] = useState("")
  const [timeRange, setTimeRange] = useState("7d")
  const [users,setUser]=useState<userType[]>([]);
  // const [filteredUsers, setFilteredUsers] = useState(users)
  const [conversations, setConversations] = useState<conversationType[]>([])
  const [positiveConversations, setPositiveConversations] = useState<number>(1)
  const [negativeConversations, setNegativeConversations] = useState<number>(1)
  const [neutralConversations, setNeutralConversations] = useState<number>(1)
  // const [queries, setQueries] = useState<string[]>([])
  const router = useRouter()

  const activeUsers = users.filter((user) => user.status === "active").length

  const api=process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const findpositiveConversations = conversations.filter(
      (conversation) => conversation.satisfaction === "neutral"
    ).length;

    const findnegativeConversations = conversations.filter(
      (conversation) => conversation.satisfaction === "neutral"
    ).length;

    const findneutralConversations = conversations.filter(
      (conversation) => conversation.satisfaction === "neutral"
    ).length;
  
    setPositiveConversations(findpositiveConversations);
    setNegativeConversations(findnegativeConversations);
    setNeutralConversations(findneutralConversations);


  }, [conversations]);

  const totalConversations = conversations.length

  const userSatisfaction = totalConversations > 0 
  ? ((neutralConversations / totalConversations) * 100).toFixed(2) 
  : "0.00"; 

  const satisfactionData = [
    { name: "positive", value: positiveConversations },
    { name: "neutral", value: neutralConversations },
    { name: "negative", value: negativeConversations}
  ]



  useEffect(()=>{
    const fetchUser=async()=>{
      const res=await fetch(`${api}/api/user/conversations`,{
        method:"GET",
        credentials:"include",
      })   
      if(!res.ok){
        console.log("error in fetching user")
        throw new Error("error in fetching user")
      }
      const data=await res.json()

      // let activeUser=0;
      // data.forEach((user:any) => {
      //   if(user.conversation>=0){
      //     activeUser++;
      //   }
      //   }) 
      setUser(data)
    }
    fetchUser()
  },[router])

  useEffect(()=>{
    const fetchConversations=async()=>{
      const res=await fetch(`${api}/api/chat/chatSummary`,{
        method:"GET",
        credentials:"include",
      })   
      if(!res.ok){
        console.log("error in fetching conversations")
        throw new Error("error in fetching conversations")
      }
      const data=await res.json()
      setConversations(data)
    }
    fetchConversations()
  },[router])

  useEffect(() => {
    // In a real application, you would check if the user is an admin
    if (!hasCookie("adminToken")) {
      router.push('/admin/login');
      // For demo purposes, we'll allow access
    }
  }, [router])

  // useEffect(() => {
  //   if (searchUser) {
  //     setFilteredUsers(
  //       users.filter(
  //         (user) =>
  //           user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
  //           user.email.toLowerCase().includes(searchUser.toLowerCase()),
  //       ),
  //     ) 
  //   } else {
  //     setFilteredUsers(users)
  //   }
  // }, [searchUser])

  // console.log(filteredUsers)

  const handleLogout =async () => {
    const res= await fetch(`${api}/api/admin/logout`, {
        method:"GET",
        credentials:"include",
    })

    if(!res.ok){
      console.log("error in logout")
      throw new Error("error in logout")
    }
    if(res.ok){
      router.push("/admin/login")   
    }

  }

  return (
    <div className="flex min-h-screen flex-col relative mx-10">
      <header className="fixed top-0 left-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 container absolute top-15 py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">+18% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userSatisfaction || 0 }</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2s</div>
              <p className="text-xs text-muted-foreground">-0.3s from last week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mt-6 ">
          <TabsList className="grid w-full grid-cols-5 md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
            <TabsTrigger value="content-moderation">Content Moderation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Daily active users over time</CardDescription>
                  <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivityData}>
                      {/* <CartesianGrid strokeDasharray="3 3" /> */}
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Satisfaction</CardTitle>
                  <CardDescription>Based on feedback</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={satisfactionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {satisfactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Message Volume</CardTitle>
                  <CardDescription>User vs AI messages</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={messageVolumeData}>
                      {/* <CartesianGrid strokeDasharray="3 3" /> */}
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="user" stroke="#3b82f6" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="ai" stroke="#10b981" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top User Queries</CardTitle>
                  <CardDescription>Most common user questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {topQueriesData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              {index + 1}
                            </div>
                            <span className="font-medium">{item.query}</span>
                          </div>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search users..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full"
                />
                <Button type="submit" size="icon" variant="ghost">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage and monitor user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conversations</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user,index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>{user.conversation}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input type="search" placeholder="Search conversations..." className="w-full" />
                <Button type="submit" size="icon" variant="ghost">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by satisfaction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
                <CardDescription>Review past conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Duration(in min)</TableHead>
                      <TableHead>Satisfaction</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((conversation) => (
                      <TableRow key={conversation.sessionId}>
                        <TableCell className="text-sm">#{conversation.sessionId}</TableCell>
                        <TableCell className="-ml-40">{conversation.user}</TableCell>
                        <TableCell>{conversation.messages}</TableCell>
                        <TableCell>{conversation.duration}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              conversation.satisfaction === "positive"
                                ? "default"
                                : conversation.satisfaction === "neutral"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {conversation.satisfaction}
                          </Badge>
                        </TableCell>
                        <TableCell>{conversation.date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Performance Tab */}
          <TabsContent value="ai-performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {aiPerformanceData.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    {metric.name === "Response Time" ? (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    ) : metric.name === "Accuracy Rate" ? (
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    ) : metric.name === "Completion Rate" ? (
                      <Brain className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metric.value}
                      {metric.unit}
                    </div>
                    <p className={`text-xs ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {metric.change > 0 ? "+" : ""}
                      {metric.change}
                      {metric.unit} from last week
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trend</CardTitle>
                  <CardDescription>Average response time in seconds</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: "Mon", value: 1.5 },
                        { name: "Tue", value: 1.4 },
                        { name: "Wed", value: 1.3 },
                        { name: "Thu", value: 1.3 },
                        { name: "Fri", value: 1.2 },
                        { name: "Sat", value: 1.2 },
                        { name: "Sun", value: 1.2 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[1, 2]} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accuracy Rate</CardTitle>
                  <CardDescription>Percentage of correct responses</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: "Mon", value: 92.1 },
                        { name: "Tue", value: 92.8 },
                        { name: "Wed", value: 93.2 },
                        { name: "Thu", value: 93.5 },
                        { name: "Fri", value: 94.0 },
                        { name: "Sat", value: 94.3 },
                        { name: "Sun", value: 94.5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[90, 100]} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
                <CardDescription>Compare different AI models</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Token Usage</TableHead>
                      <TableHead>Cost per 1K tokens</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">GPT-4</TableCell>
                      <TableCell>1.2s</TableCell>
                      <TableCell>94.5%</TableCell>
                      <TableCell>1,250</TableCell>
                      <TableCell>$0.06</TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">GPT-3.5 Turbo</TableCell>
                      <TableCell>0.8s</TableCell>
                      <TableCell>91.2%</TableCell>
                      <TableCell>1,450</TableCell>
                      <TableCell>$0.002</TableCell>
                      <TableCell>
                        <Badge variant="outline">Available</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Claude 3</TableCell>
                      <TableCell>1.1s</TableCell>
                      <TableCell>93.8%</TableCell>
                      <TableCell>1,350</TableCell>
                      <TableCell>$0.03</TableCell>
                      <TableCell>
                        <Badge variant="outline">Available</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation Tab */}
          <TabsContent value="content-moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
                <CardDescription>Review potentially problematic content</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFlaggedContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">#{item.id}</TableCell>
                        <TableCell>{item.user}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{item.content}</div>
                        </TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === "pending" ? "secondary" : "outline"}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content Moderation Stats</CardTitle>
                  <CardDescription>Overview of moderation activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>Total Flagged Content</span>
                      </div>
                      <span className="font-bold">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Pending Review</span>
                      </div>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Approved</span>
                      </div>
                      <span className="font-bold">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Rejected</span>
                      </div>
                      <span className="font-bold">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Moderation Categories</CardTitle>
                  <CardDescription>Types of flagged content</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Harmful", value: 35 },
                          { name: "Inappropriate", value: 25 },
                          { name: "Spam", value: 20 },
                          { name: "Other", value: 20 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#f87171" />
                        <Cell fill="#fb923c" />
                        <Cell fill="#facc15" />
                        <Cell fill="#94a3b8" />
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Moderation Settings</CardTitle>
                <CardDescription>Configure content moderation rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-flag harmful content</h3>
                      <p className="text-sm text-muted-foreground">Automatically flag content that may be harmful</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-flag inappropriate content</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically flag content that may be inappropriate
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-flag spam</h3>
                      <p className="text-sm text-muted-foreground">Automatically flag content that may be spam</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-reject severe violations</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically reject content that severely violates guidelines
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

