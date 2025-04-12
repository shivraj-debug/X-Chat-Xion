// import type { NextAuthOptions } from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import GitHubProvider from "next-auth/providers/github"
// import GoogleProvider from "next-auth/providers/google"
// import axios from "axios"

// // const API_URL = process.env.API_URL || "http://localhost:5000/api"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID as string,
//       clientSecret: process.env.GITHUB_SECRET as string,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null
//         }

//         try {
//           // Authenticate against Express.js backend
//           const response = await axios.post("http://localhost:5000/api/user/login", {
//             email: credentials.email,
//             password: credentials.password,
//           })

//           const user = response.data.user

//           if (user) {
//             return {
//               id: user._id,
//               name: user.name,
//               email: user.email,
//               image: user.image,
//             }
//           }

//           return null
//         } catch (error) {
//           console.error("Error during authentication:", error)
//           return null
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/login",
//   },
//   callbacks: {
//     async jwt({ token, user, account }) {
//       if (user) {
//         token.id = user.id
//       }
//       return token
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string
//       }
//       return session
//     },
//   },
// }

