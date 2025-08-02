"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useState } from "react"
import Link from "next/link" // Import Link for navigation
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Import Card components
import { ArrowRightIcon, SearchIcon, UserPlusIcon, InfoIcon } from "lucide-react" // Import icons

export default function Home() {
  const router = useRouter()
  const [profession, setProfession] = useState("dental-hygienist")
  const [location, setLocation] = useState("Montreal, Quebec")

  const handleSearch = () => {
    router.push(`/results?profession=${profession}&location=${encodeURIComponent(location)}`)
  }

  const handleOnboard = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "temp1@example.com" }), // You can randomize this or get from user input
      })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url // Redirects to Stripe onboarding
      } else {
        alert("Failed to onboard: " + JSON.stringify(data))
      }
    } catch (error) {
      console.error("Onboard error:", error)
      alert("Something went wrong while onboarding.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex h-[600px] items-center justify-center bg-gradient-to-br from-teal-600 to-emerald-800 px-4 py-12 text-center text-white md:px-6">
        <div className="z-10 max-w-4xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Premier On-demand Dental Staffing Solution
          </h1>
          <p className="text-lg md:text-xl">
            Find skilled dental professionals or offer your services with ease. Connect instantly, simplify staffing.
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow-lg md:flex-row md:gap-2">
            <div className="flex-1">
              <Label htmlFor="profession" className="sr-only">
                Profession
              </Label>
              <Select value={profession} onValueChange={setProfession}>
                <SelectTrigger id="profession" className="w-full text-gray-800">
                  <SelectValue placeholder="Select Profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dental-hygienist">Dental Hygienist</SelectItem>
                  {/* More options later */}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="location" className="sr-only">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="Location, e.g., Montreal, Quebec"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-gray-800"
              />
            </div>
            <Button onClick={handleSearch} className="w-full bg-teal-700 hover:bg-teal-800 md:w-auto">
              <SearchIcon className="mr-2 h-5 w-5" /> Search
            </Button>
          </div>
          {/* <Link href="/onboard" className="inline-block"> */}
            <Button className="mt-6" onClick={handleOnboard}>
              Onboard as a Temp
            </Button>
        </div>
      </section>

      {/* Demo Instructions Section */}
      <section className="bg-white px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-8 text-3xl font-bold text-gray-800 md:text-4xl">Welcome to the Stripe Marketplace Demo!</h2>
          <p className="mb-12 text-lg text-gray-600">
            This demo showcases a common marketplace flow using Stripe Connect. You can explore two main paths: hiring
            a temp (as a clinic) or onboarding as a temp (as a professional).
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Clinic Path Card */}
            <Card className="p-6 shadow-lg text-left">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <SearchIcon className="h-6 w-6 text-teal-600" /> For Clinics: Hire a Temp
                </CardTitle>
                <CardDescription className="mt-2 text-gray-600">
                  Discover how a clinic finds and books a dental professional, including the payment process.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold">What this page allows you to do:</p>
                <ul className="list-outside list-disc text-gray-700 space-y-1 pl-5">

                  <li>
                    Search for Dental Professionals: Use the search bar above to find available temps by profession
                    and location.
                  </li>
                  <li>Navigate to Search Results: Clicking "Search" will take you to a list of available temps.</li>
                </ul>
                <p className="font-semibold mt-4">Button Functions:</p>
                <ul className="list-outside list-disc text-gray-700 space-y-1 pl-5">

                  <li>
                    "Profession" Select Input: Choose the type of dental professional you need (e.g., "Dental
                    Hygienist").
                  </li>
                  <li>
                    "Location" Text Input: Enter the city or region where you need a professional (e.g., "Montreal,
                    Quebec").
                  </li>
                  <li>
                    "Search" Button: Submits your search criteria and navigates to the next step in the hiring flow:
                    the "Available Temps" page.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Temp Onboarding Path Card */}
            <Card className="p-6 shadow-lg text-left">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <UserPlusIcon className="h-6 w-6 text-teal-600" /> For Temps: Onboard to the Platform
                </CardTitle>
                <CardDescription className="mt-2 text-gray-600">
                  See how a dental professional registers and connects their Stripe account to receive payouts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold">What this page allows you to do:</p>
                <ul className="list-outside list-disc text-gray-700 space-y-1 pl-5">

                  <li>
                    Initiate Onboarding: Click the "Onboard as a Temp" button to start the registration and Stripe
                    Connect setup.
                  </li>
                </ul>
                <p className="font-semibold mt-4">Button Functions:</p>
                <ul className="list-outside list-disc text-gray-700 space-y-1 pl-5">

                  <li>
                    "Onboard as a Temp" Button: This button triggers an API call to your backend to create a new
                    Stripe Express account. You will then be redirected to Stripe's secure onboarding flow to provide
                    your details (bank account, identity verification, etc.). This is crucial for enabling payouts.
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
                  <InfoIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-sm text-blue-800">
                    Note: For this demo, a fixed email ("temp1@example.com") is used for onboarding. In a real
                    application, this would come from user input or an authentication system.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 px-4 py-8 text-center text-white">
        <div className="mx-auto max-w-6xl">
          <p>&copy; {new Date().getFullYear()} Your Dental Staffing Solution. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link href="https://github.com/lakhwindersinghx/Stripe-Marketplace.git" className="text-gray-400 hover:text-white">
              Github
            </Link>
            <Link href="https://www.linkedin.com/in/lakhwindersinghx/" className="text-gray-400 hover:text-white">
              LinkedIn
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
