"use client"

// API Call 
import {RegisterLink, LoginLink} from "@kinde-oss/kinde-auth-nextjs/components";


import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    // In a real app, you would send this data to your backend API
    // For this example, we'll just simulate a successful login
    console.log("Login data:", formData)

    // Simulate API call delay
    setTimeout(() => {
      // Redirect to dashboard after successful login
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Log in to your account</CardTitle>
          <CardDescription>Welcome back! Continue tracking your productivity</CardDescription>
        </CardHeader>
        <CardContent className="text-center justify-center">
          <Button asChild>
            <LoginLink>Log In</LoginLink>
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Button asChild>
              <RegisterLink>Register</RegisterLink>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
