"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Import Card components for styling
import { InfoIcon } from "lucide-react" // Import InfoIcon

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
console.log("Stripe Publishable Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Props for the main PaymentMethodSetup component
interface PaymentMethodSetupProps {
  onSetupSuccess: (paymentMethodId: string) => void
  onCancel: () => void
  customerId: string | null
}

// Props for the inner CheckoutForm component
interface CheckoutFormProps {
  onSetupSuccess: (paymentMethodId: string) => void
  onCancel: () => void
  customerId: string | null
}

const CheckoutForm = ({ onSetupSuccess, onCancel, customerId }: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !customerId) {
      setMessage("Stripe.js not loaded or customer ID missing.")
      return
    }
    setIsLoading(true)

    try {
      // 1. Confirm the SetupIntent on the client-side
      const { setupIntent, error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`, // This URL is for redirect after 3D Secure etc.
        },
        redirect: "if_required",
      })

      if (error) {
        setMessage(error.message || "An unknown error occurred during setup.")
      } else if (setupIntent && setupIntent.status === "succeeded") {
        const paymentMethodId = setupIntent.payment_method as string

        // 2. Call your backend to explicitly attach the PaymentMethod to the Customer
        const attachResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/attach-payment-method`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_method_id: paymentMethodId,
            customer_id: customerId,
          }),
        })

        const attachData = await attachResponse.json()

        if (!attachResponse.ok) {
          throw new Error(attachData.detail || "Failed to attach payment method to customer.")
        }

        setMessage("Payment method setup and attached successfully!")
        onSetupSuccess(paymentMethodId) // Pass the payment method ID after successful attachment
      } else {
        setMessage("An unexpected error occurred.")
      }
    } catch (err: any) {
      setMessage(err.message || "An error occurred during setup.")
      console.error("Error in handleSubmit:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement id="payment-element" />
      <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full bg-teal-600 hover:bg-teal-700">
        <span id="button-text">{isLoading ? "Setting up..." : "Save Payment Method"}</span>
      </Button>
      <Button variant="outline" onClick={onCancel} className="w-full bg-transparent">
        Cancel
      </Button>
      {message && (
        <div id="payment-message" className="text-sm text-center text-red-500">
          {message}
        </div>
      )}
    </form>
  )
}

export const PaymentMethodSetup = ({ onSetupSuccess, onCancel, customerId }: PaymentMethodSetupProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("NEXT_PUBLIC_BACKEND_API_URL:", process.env.NEXT_PUBLIC_BACKEND_API_URL)

    const fetchSetupIntent = async () => {
      if (!customerId) {
        setError("Customer ID is required to set up a payment method.")
        return
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/create-setup-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_id: customerId }),
        })
        const data = await response.json()
        if (response.ok) {
          setClientSecret(data.client_secret)
        } else {
          setError(data.detail || "Failed to fetch setup intent client secret.")
        }
      } catch (err) {
        setError("Network error or backend not reachable.")
        console.error("Error fetching setup intent:", err)
      }
    }
    fetchSetupIntent()
  }, [customerId])

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 border border-red-300 rounded-lg bg-red-50">
        Error: {error}
        <Button variant="outline" onClick={onCancel} className="mt-4 w-full bg-transparent">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <Card className="p-6 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-gray-500" /> Secure Payment Setup
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter your card details below. Your payment method will be securely saved to your Stripe Customer profile for
          future bookings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clientSecret ? (
          <Elements
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#0D9488", // Teal-600
                },
              },
            }}
            stripe={stripePromise}
          >
            <CheckoutForm onSetupSuccess={onSetupSuccess} onCancel={onCancel} customerId={customerId} />
          </Elements>
        ) : (
          <div className="text-center p-4">Loading payment form...</div>
        )}
      </CardContent>
    </Card>
  )
}
