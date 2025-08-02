"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input" // Import Input for email field
import { CalendarIcon, ClockIcon, InfoIcon, CreditCardIcon, CheckCircleIcon } from "lucide-react"
import { PaymentMethodSetup } from "./payment-method-setup"

// Assuming TempProfile is defined in "@/types"
import type { TempProfile } from "@/types"

export default function BookForm({ temp }: { temp: TempProfile }) {
  const [shiftDate, setShiftDate] = useState("")
  const [start, setStart] = useState("08:00")
  const [end, setEnd] = useState("13:00")
  const [lunchBreakType, setLunchBreakType] = useState("Paid")
  const [lunchDuration, setLunchDuration] = useState("0:15")
  const [showPaymentMethodSetup, setShowPaymentMethodSetup] = useState(false)
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false)
  const [savedPaymentMethodId, setSavedPaymentMethodId] = useState<string | null>(null)

  // States for customer identification without full auth
  const [userEmailInput, setUserEmailInput] = useState("")
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)
  const [customerError, setCustomerError] = useState<string | null>(null)

  // Initial date setup
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    setShiftDate(`${year}-${month}-${day}`)
  }, [])

  // Effect to get or create Stripe Customer ID based on email input
  useEffect(() => {
    const getOrCreateStripeCustomer = async () => {
      if (!userEmailInput) {
        setCustomerId(null)
        setIsLoadingCustomer(false)
        setCustomerError(null)
        return
      }

      setIsLoadingCustomer(true)
      setCustomerError(null)

      // Generate a unique client-side ID if one doesn't exist
      let clientSideUserId = localStorage.getItem("clientSideUserId")
      if (!clientSideUserId) {
        clientSideUserId = crypto.randomUUID() // Generate a UUID
        localStorage.setItem("clientSideUserId", clientSideUserId)
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/get-or-create-stripe-customer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: clientSideUserId, email: userEmailInput }),
        })
        const data = await response.json()
        if (response.ok) {
          setCustomerId(data.customer_id)
          console.log("Stripe Customer ID:", data.customer_id)
        } else {
          console.error("Failed to get or create Stripe Customer:", data)
          setCustomerError(data.detail || "Failed to initialize payment.")
        }
      } catch (error) {
        console.error("Error fetching Stripe Customer ID:", error)
        setCustomerError("Network error or backend not reachable.")
      } finally {
        setIsLoadingCustomer(false)
      }
    }

    // Debounce the API call to avoid too many requests while typing
    const handler = setTimeout(() => {
      getOrCreateStripeCustomer()
    }, 500) // Wait 500ms after user stops typing

    return () => {
      clearTimeout(handler) // Cleanup on unmount or re-render
    }
  }, [userEmailInput]) // Re-run when userEmailInput changes

  const calculateHours = useMemo(() => {
    if (!start || !end) return 0
    const [h1, m1] = start.split(":").map(Number)
    const [h2, m2] = end.split(":").map(Number)
    const startTimeInMinutes = h1 * 60 + m1
    const endTimeInMinutes = h2 * 60 + m2
    let totalShiftMinutes = endTimeInMinutes - startTimeInMinutes
    if (totalShiftMinutes < 0) {
      totalShiftMinutes += 24 * 60
    }
    let lunchMinutes = 0
    if (lunchBreakType === "Unpaid") {
      const [lh, lm] = lunchDuration.split(":").map(Number)
      lunchMinutes = lh * 60 + lm
    }
    const netShiftMinutes = Math.max(0, totalShiftMinutes - lunchMinutes)
    return netShiftMinutes / 60
  }, [start, end, lunchBreakType, lunchDuration])

  const hours = calculateHours
  const hourlyRate = temp?.rate ?? 58
  const placementFee = 49.0
  const shiftPaymentHandlingFee = 11.31
  const taxesRate = 0.0302
  const professionalFee = hourlyRate * hours
  const tempfinderFeeBeforeTaxes = placementFee + shiftPaymentHandlingFee
  const totalBeforeTaxes = professionalFee + tempfinderFeeBeforeTaxes
  const taxes = totalBeforeTaxes * taxesRate
  const totalCost = totalBeforeTaxes + taxes

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString + "T00:00:00")
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
      weekday: "short",
    }
    return date.toLocaleDateString("en-US", options)
  }

  const handleSendBookingRequest = async () => {
    if (!userEmailInput || !customerId) {
      alert("Please enter your email and ensure payment setup is ready.")
      return
    }
    if (!hasPaymentMethod || !savedPaymentMethodId) {
      alert("Please add a payment method first.")
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalCost,
          account_id: temp.account_id,
          payment_method_id: savedPaymentMethodId,
          customer_id: customerId,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        console.log("Payment Intent created/confirmed:", data)
        alert("Booking request sent and payment intent confirmed!")
      } else {
        console.error("Failed to create/confirm payment intent:", data)
        alert(`Failed to send booking request: ${data.detail || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error sending booking request:", error)
      alert("An error occurred while sending the booking request.")
    }
  }

  // Disable the form if customer ID is loading, not available, or email is missing
  const isFormDisabled =
    isLoadingCustomer || !customerId || !userEmailInput || !hasPaymentMethod || hours <= 0 || !shiftDate

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT SIDE - Booking Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* User Email Input */}
        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Your Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email*
              </label>
              <Input
                id="user-email"
                type="email"
                placeholder="your.email@example.com"
                value={userEmailInput}
                onChange={(e) => setUserEmailInput(e.target.value)}
                required
                className="w-full"
              />
              {isLoadingCustomer && <p className="text-sm text-gray-500 mt-1">Loading customer ID...</p>}
              {customerError && <p className="text-sm text-red-500 mt-1">{customerError}</p>}
              {!customerId && userEmailInput && !isLoadingCustomer && !customerError && (
                <p className="text-sm text-orange-500 mt-1">Enter a valid email to proceed with payment setup.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Shift Details */}
        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Shift Details</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Shift Date</p>
                  <p className="font-medium">{formatDate(shiftDate)}</p>
                </div>
              </div>
              <Button variant="link" className="text-teal-600">
                Edit
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Shift Hours</p>
                  <p className="font-medium">
                    {start} - {end} ({hours.toFixed(1)}h)
                  </p>
                </div>
              </div>
              <Button variant="link" className="text-teal-600">
                Edit
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label htmlFor="lunch-break" className="block text-sm font-medium text-gray-700 mb-1">
                Lunch Break*
              </label>
              <Select value={lunchBreakType} onValueChange={setLunchBreakType}>
                <SelectTrigger id="lunch-break" className="w-full">
                  <SelectValue placeholder="Select lunch type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="lunch-duration" className="block text-sm font-medium text-gray-700 mb-1">
                Lunch Duration*
              </label>
              <Select value={lunchDuration} onValueChange={setLunchDuration}>
                <SelectTrigger id="lunch-duration" className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0:00">0:00h</SelectItem>
                  <SelectItem value="0:15">0:15h</SelectItem>
                  <SelectItem value="0:30">0:30h</SelectItem>
                  <SelectItem value="0:45">0:45h</SelectItem>
                  <SelectItem value="1:00">1:00h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        {/* Payment Method */}
        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Payment Method <InfoIcon className="h-4 w-4 text-gray-400" />
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            You'll be charged the amount shown under <span className="font-bold">Total</span> after shift completion,
            using your default payment method.
          </p>
          {!hasPaymentMethod && !showPaymentMethodSetup && (
            <div className="border border-red-300 rounded-lg p-6 text-center bg-red-50/50">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="font-semibold text-gray-700">No Payment Method yet!</p>
              <p className="text-sm text-gray-500 mb-4">Please add a valid payment method for quick shift filling.</p>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => setShowPaymentMethodSetup(true)}
                disabled={isLoadingCustomer || !customerId || !userEmailInput} // Disable if customer ID is loading or not available
              >
                Add Payment Method
              </Button>
            </div>
          )}
          {showPaymentMethodSetup && (
            <PaymentMethodSetup
              onSetupSuccess={(paymentMethodId) => {
                setHasPaymentMethod(true)
                setSavedPaymentMethodId(paymentMethodId)
                setShowPaymentMethodSetup(false) // Hide setup form after success
              }}
              onCancel={() => setShowPaymentMethodSetup(false)}
              customerId={customerId} // Pass customerId to PaymentMethodSetup
            />
          )}
          {hasPaymentMethod && (
            <div className="border border-green-300 rounded-lg p-6 text-center bg-green-50/50">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="font-semibold text-green-700">Payment Method Added!</p>
              <p className="text-sm text-gray-500">Your payment method is ready for future bookings.</p>
            </div>
          )}
        </Card>
      </div>
      {/* RIGHT SIDE - Summary Card */}
      <Card className="lg:col-span-1 p-6 shadow-md bg-white sticky top-6 h-fit">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{temp.name}</h3>
            <p className="text-sm text-gray-600">{temp.profession || "Registered Dental Hygienist"}</p>
          </div>
          <span className="text-teal-600 font-bold text-lg">${hourlyRate}/h</span>
        </div>
        <h4 className="text-md font-semibold mb-3">Shift Estimated Total</h4>
        <p className="text-sm text-gray-500 mb-4">
          This is an estimate. The final amount will show after the Professional completes shift and submits their
          actual work hours.
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Professional's Fee</p>
            <p>${professionalFee.toFixed(2)}</p>
          </div>
          <p className="text-xs text-gray-500 ml-2">
            ${hourlyRate}/h x {hours.toFixed(1)} hours
            {lunchBreakType === "Unpaid" && lunchDuration !== "0:00" && <span> ({lunchDuration}h unpaid lunch)</span>}
          </p>
          <div className="pt-3 border-t border-gray-200">
            <p className="font-semibold mb-2">Tempfinder Fee</p>
            <p className="text-xs text-gray-500 mb-2">You are currently on Pay Per Hire plan</p>
            <div className="flex justify-between">
              <p>Placement fee</p>
              <p>${placementFee.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="flex items-center gap-1">
                Shift Payment Handling Fee <InfoIcon className="h-3 w-3 text-gray-400" />
              </p>
              <p>${shiftPaymentHandlingFee.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p>Taxes</p>
              <p>${taxes.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200">
          <p className="text-xl font-bold">Total (CAD)</p>
          <p className="text-xl font-bold">${totalCost.toFixed(2)}</p>
        </div>
        <p className="text-sm text-gray-500 mt-1">Billed upon shift completion.</p>
        <div className="bg-orange-50 border border-orange-200 text-orange-700 p-3 rounded-lg text-sm mt-6">
          <p>
            Your shift won't be confirmed until the Professional accepts your request. You also won't be charged until
            shift completion.
          </p>
        </div>
        <Button
          className="mt-6 bg-teal-600 hover:bg-teal-700 text-white w-full py-2 rounded"
          onClick={handleSendBookingRequest}
          disabled={isFormDisabled}
        >
          Send Booking Request
        </Button>
      </Card>
    </div>
  )
}
