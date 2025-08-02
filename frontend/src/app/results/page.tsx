"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link" // Import Link for navigation
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeftIcon, InfoIcon } from "lucide-react"

// Assuming TempProfile is defined in "@/types"
import type { TempProfile } from "@/types"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const professionQuery = searchParams.get("profession") || ""
  const locationQuery = searchParams.get("location") || ""

  const [temps, setTemps] = useState<TempProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemps = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL
        if (!backendApiUrl) {
          console.error("NEXT_PUBLIC_BACKEND_API_URL is not defined.")
          setError("Backend API URL is not configured.")
          setIsLoading(false)
          return
        }

        const res = await fetch(`${backendApiUrl}/api/temps`)
        const data = await res.json()

        if (res.ok && Array.isArray(data.temps)) {
          const allTemps: TempProfile[] = data.temps

          // Map URL-friendly profession to Firebase-stored profession
          const professionMap: { [key: string]: string } = {
            "dental-hygienist": "Registered Dental Hygienist",
            "dental-assistant": "Dental Assistant",
            dentist: "Dentist",
            // Add other mappings as needed
          }

          const targetProfession = professionMap[professionQuery] || professionQuery

          const filtered = allTemps.filter(
            (temp) =>
              temp.available &&
              temp.profession === targetProfession &&
              (locationQuery.toLowerCase().includes(temp.city.toLowerCase()) ||
                temp.city.toLowerCase().includes(locationQuery.toLowerCase())),
          )
          setTemps(filtered)
        } else {
          console.error("Unexpected API response structure or error:", data)
          setError(data.detail || "Failed to load temps due to unexpected data.")
        }
      } catch (err) {
        console.error("Failed to load temps:", err)
        setError("Network error or backend not reachable.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTemps()
  }, [locationQuery, professionQuery]) // Depend on the query parameters

  const handleHire = (accountId: string) => {
    router.push(`/book/${accountId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b p-4 flex items-center shadow-sm">
        <Link href="/" className="text-gray-600 hover:text-gray-800 mr-4">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Available Temps</h1>
      </header>

      <main className="flex-1 max-w-6xl mx-auto p-6 space-y-8">
        {/* Demo Instructions Section */}
        <Card className="p-6 shadow-lg text-left bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-blue-800">
              <InfoIcon className="h-6 w-6 text-blue-600" /> Page 2: Available Temps
            </CardTitle>
            <CardDescription className="mt-2 text-blue-700">
              This page displays dental professionals matching your search criteria. As a Clinic user, you can
              review their profiles and proceed to book a shift.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-800">
            <p className="font-semibold">What this page allows you to do:</p>
            <ul className="list-outside list-disc text-gray-700 space-y-1 pl-5">

              <li>View Available Professionals: See a list of temps ready for hire.</li>
              <li>Review Temp Profiles: Each card provides key details about a professional.</li>
              <li>Initiate Hiring Process: Select a temp to proceed with booking.</li>
            </ul>
            <p className="font-semibold mt-4">Button Functions:</p>
            <ul className="list-outside list-disc text-gray-700 space-y-1 pl-5">



              <li>
                "Hire" Button: Clicking this button will take you to the Booking Details page (Page 3) for the
                selected professional. This is where you'll specify shift details and set up payment.
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-md flex items-start gap-2">
              <InfoIcon className="h-5 w-5 text-blue-700 flex-shrink-0 mt-1" />
              <p className="text-sm text-blue-900">
                Note: This list is fetched from your backend based on the search parameters. Ensure your backend has
                `temps` registered with matching `profession` and `city` for results to appear.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Display Search Parameters */}
        <div className="text-center text-gray-600">
          <p>
            Showing results for: {professionQuery || "Any Profession"} in {locationQuery || "Any Location"}
          </p>
        </div>

        {/* List of Available Temps */}
        {isLoading ? (
          <div className="text-center text-gray-600">Loading available temps...</div>
        ) : error ? (
          <div className="text-center text-red-600 p-4 border border-red-300 rounded-lg bg-red-50">Error: {error}</div>
        ) : temps.length === 0 ? (
          <div className="text-center text-gray-600 p-4 border border-gray-300 rounded-lg bg-gray-50">
            No matching temps found for your search criteria.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {temps.map((temp) => (
              <Card key={temp.account_id} className="p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{temp.name}</h3>
                  <p className="text-gray-600">City: {temp.city}</p>
                  <p className="text-gray-600">Profession: {temp.profession}</p>
                  <p className="text-sm font-medium mt-2">
                    Availability:{" "}
                    {temp.available ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </p>
                </div>
                <Link href={`/book/${temp.account_id}`} className="mt-6">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={!temp.available}>
                    Hire
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer (consistent with landing page) */}
      <footer className="bg-gray-800 px-4 py-8 text-center text-white">
        <div className="mx-auto max-w-6xl">
          <p>&copy; {new Date().getFullYear()} Your Dental Staffing Solution. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link href="#" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
