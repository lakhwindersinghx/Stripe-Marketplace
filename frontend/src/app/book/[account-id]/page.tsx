import { notFound } from "next/navigation"
import BookForm from "./book-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon } from "lucide-react"
import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

// Assuming TempProfile is defined in "@/types"
import type { TempProfile } from "@/types"

// This function now correctly fetches data on the server.
async function getTempById(accountId: string): Promise<TempProfile | null> {
  try {
    // Use an environment variable for your backend API URL for deployability.
    // Ensure BACKEND_API_URL is set in your Vercel project settings.
    const res = await fetch(`${process.env.BACKEND_API_URL}/api/temps`, {
      // Optional: Add revalidation options if your data changes frequently
      // next: { revalidate: 3600 } // Revalidate data every hour
    })

    if (!res.ok) {
      console.error(`Failed to fetch temps: ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    console.log("Fetched from API:", data)

    const temps = Array.isArray(data) ? data : data.temps
    const found = temps.find((t: TempProfile) => t.account_id === accountId)
    console.log("Found temp:", found)

    return found || null
  } catch (error) {
    console.error("Error fetching temp data:", error)
    return null
  }
}

export default async function BookPage({ params }: { params: { "account-id": string } }) {
  const account_id = params["account-id"]
  const temp = await getTempById(account_id)

  if (!temp) {
    notFound() // Renders Next.js's 404 page if temp is not found
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b p-4 flex items-center shadow-sm">
        <Link
          href={`/results?profession=${temp.profession}&location=${temp.city}`}
          className="text-gray-600 hover:text-gray-800 mr-4"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Booking Details</h1>
      </header>

      <main className="flex-1 max-w-7xl mx-auto p-6 space-y-8">
        {/* Demo Instructions Section */}
        <Card className="p-6 shadow-lg text-left bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-blue-800">
              <InfoIcon className="h-6 w-6 text-blue-600" /> Page 3: Booking Details
            </CardTitle>
            <CardDescription className="mt-2 text-blue-700">
              As a Clinic user, this page allows you to finalize the booking for {temp.name}. You'll specify
              shift details, review the estimated cost, and securely set up your payment method via Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-800">
            <p className="font-semibold">What this page allows you to do:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Confirm Temp Details: Verify the professional you are booking.</li>
              <li>Adjust Shift Details: Set the exact date, time, and lunch break for the shift.</li>
              <li>Review Estimated Cost: See a transparent breakdown of all fees.</li>
              <li>Provide Contact Email: Enter your email to link your payment method to a Stripe Customer.</li>
              <li>Add/Manage Payment Method: Securely add your credit card details using Stripe Elements.</li>
              <li>Send Booking Request: Submit the booking, which initiates the payment process.</li>
            </ul>
            <p className="font-semibold mt-4">Key Elements & Button Functions:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                "Your Email" Input: Enter your email. This is used to create or retrieve your Stripe Customer ID,
                which is essential for saving payment methods and processing payments.
              </li>
              <li>
                "Shift Details" Section: Adjust the shift date, start/end times, and lunch break. The "Edit" buttons
                are placeholders for more advanced date/time pickers.
              </li>
              <li>
                "Add Payment Method" Button: Reveals the secure Stripe payment form. This button is enabled once you
                provide a valid email and your Stripe Customer ID is ready.
              </li>
              <li>
                Stripe Payment Form: A secure form provided by Stripe to enter your credit card details.
                <ul className="list-outside list-disc text-gray-700 space-y-1 pl-5">

                  <li>
                    "Save Payment Method" Button: Submits your card details to Stripe. This creates a SetupIntent
                    and attaches your card to your Stripe Customer profile for future use.
                  </li>
                  <li>"Cancel" Button: Hides the payment form if you decide not to add a method at this time.</li>
                </ul>
              </li>
              <li>"Shift Estimated Total" Summary: Displays a detailed breakdown of the costs.</li>
              <li>
                "Send Booking Request" Button: This is the final step. It triggers the creation and confirmation of
                a Stripe Payment Intent, charging your saved payment method for the estimated total. This button is
                disabled until a payment method is successfully added.
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-md flex items-start gap-2">
              <InfoIcon className="h-5 w-5 text-blue-700 flex-shrink-0 mt-1" />
              <p className="text-sm text-blue-900">
                Important: The payment is processed immediately upon clicking "Send Booking Request" in this demo.
                In a real application, you might only charge upon shift completion or professional acceptance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* The actual BookForm component */}
        <BookForm temp={temp} />
      </main>

      {/* Footer (consistent with other pages) */}
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
