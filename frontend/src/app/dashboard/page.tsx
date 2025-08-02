// // src/app/dashboard/page.tsx (or /dashboard.tsx)

// 'use client';
// import { useEffect, useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';

// export default function DashboardPage() {
//   const [accountId, setAccountId] = useState('');
//   const [name, setName] = useState('');
//   const [city, setCity] = useState('');
//   const [registered, setRegistered] = useState(false);

//   useEffect(() => {
//     const id = localStorage.getItem("account_id");
//     if (id) setAccountId(id);
//   }, []);

//   const handleRegister = async () => {
//     const res = await fetch("http://localhost:8000/api/register-temp", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ account_id: accountId, name, city, available: true }),
//     });

//     if (res.ok) setRegistered(true);
//   };

//   if (registered) {
//     return <p className="text-center mt-10 text-green-600 font-bold">✅ You are now registered on SoDental!</p>;
//   }

//   return (
//     <div className="max-w-xl mx-auto mt-10">
//       <h2 className="text-2xl mb-4">Complete Your Temp Profile</h2>
//       <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="mb-2" />
//       <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="mb-4" />
//       <Button onClick={handleRegister}>Submit</Button>
//     </div>
//   );
// }
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function CompleteTempProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [profession, setProfession] = useState("Registered Dental Hygienist") // Default profession
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // --- START CHANGE ---
  const accountId = searchParams.get("accountId") // Get accountId from URL query params
  // --- END CHANGE ---

  useEffect(() => {
    if (!accountId) {
      setError("Missing account ID. Please start the onboarding process again.")
    }
  }, [accountId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!accountId) {
      setError("Account ID is missing. Cannot complete profile.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/register-temp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_id: accountId,
          name,
          city,
          profession, // Include profession
          available: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Profile completed successfully! You are now listed as an available temp.")
        // Optionally redirect to a success page or temp dashboard
        router.push(`/temp-dashboard?accountId=${accountId}`)
      } else {
        setError(data.message || data.detail || "Failed to complete profile.")
      }
    } catch (err) {
      console.error("Error registering temp profile:", err)
      setError("Network error or backend not reachable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-gray-900">Complete Your Temp Profile</CardTitle>
          <p className="mt-2 text-sm text-gray-600">Just a few more details to get you listed on the platform.</p>
        </CardHeader>
        <CardContent>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="city" className="sr-only">
                  City
                </label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              {/* --- START CHANGE (Added Profession Select) --- */}
              <div>
                <label htmlFor="profession" className="sr-only">
                  Profession
                </label>
                <Select value={profession} onValueChange={setProfession}>
                  <SelectTrigger
                    id="profession"
                    className="rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  >
                    <SelectValue placeholder="Select Profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Registered Dental Hygienist">Registered Dental Hygienist</SelectItem>
                    <SelectItem value="Dental Assistant">Dental Assistant</SelectItem>
                    <SelectItem value="Dentist">Dentist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* --- END CHANGE --- */}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center mt-4" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 text-sm text-center mt-4" role="status">
                {success}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 mt-6"
                disabled={loading || !accountId}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
