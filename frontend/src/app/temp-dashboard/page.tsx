"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TempDashboardPage() {
  const searchParams = useSearchParams()
  const accountId = searchParams.get("accountId")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8 text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-gray-900">Welcome to Your Dashboard!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-gray-700">Your profile has been successfully created.</p>
          {accountId && (
            <p className="text-sm text-gray-500">
              Account ID: <span className="font-mono text-gray-600">{accountId}</span>
            </p>
          )}
          <p className="text-md text-gray-600">
            This is your temporary dashboard. More features will be available soon!
          </p>
          <Link href="/">
            <Button className="mt-6 bg-teal-600 hover:bg-teal-700 text-white">Go to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
