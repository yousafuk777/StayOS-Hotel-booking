'use client'

import { useState, useEffect } from 'react'
import { 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'

interface PaymentStepProps {
  clientSecret: string
  reference: string
  amount: number
  currency: string
  onSuccess: () => void
  onBack: () => void
}

export default function PaymentStep(props: PaymentStepProps) {
  const [isLoadingMock, setIsLoadingMock] = useState(false)

  if (props.clientSecret === 'mock_secret') {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 text-center">
          <ShieldCheckIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-yellow-900 mb-2">Simulated Payment Mode</h3>
          <p className="text-sm text-yellow-800 mb-6">
            Stripe is not configured or not available in your region. This is a simulation: no real payment information is required.
          </p>
          
          <div className="bg-white/50 p-4 rounded-lg mb-6 text-left">
            <p className="text-xs font-semibold text-yellow-900 uppercase mb-2">Simulation Details</p>
            <div className="space-y-1">
              <p className="text-sm text-yellow-800">Booking Ref: <span className="font-mono">{props.reference}</span></p>
              <p className="text-sm text-yellow-800">Authorization: <span className="font-bold">${props.amount}</span></p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={props.onBack}
              className="flex-1 px-6 py-3 border border-yellow-300 text-yellow-900 font-semibold rounded-lg hover:bg-yellow-100 transition cursor-pointer"
              disabled={isLoadingMock}
            >
              Back
            </button>
            <button
              onClick={() => {
                setIsLoadingMock(true)
                setTimeout(() => {
                  props.onSuccess()
                }, 1500)
              }}
              disabled={isLoadingMock}
              className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoadingMock ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Simulating...
                </>
              ) : (
                'Confirm Simulation'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <RealStripeForm {...props} />
}

function RealStripeForm({ 
  reference, 
  amount, 
  onSuccess, 
  onBack 
}: PaymentStepProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking-success?ref=${reference}`,
      },
      redirect: 'if_required',
    })

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred.")
      } else {
        setMessage("An unexpected error occurred.")
      }
      setIsLoading(false)
    } else if (paymentIntent && paymentIntent.status === "requires_capture") {
      // Successful authorization!
      onSuccess()
    } else {
      setMessage("Payment status: " + (paymentIntent?.status || "Unknown"))
      setIsLoading(false)
    }
  }

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheckIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Secure Authorization</p>
          <p>Your card will be verified and the funds (${amount}) will be held. You will only be charged when you check in at the hotel.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
        
        {message && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-100">
            ❌ {message}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer active:scale-95"
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading || !stripe || !elements}
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <LockClosedIcon className="w-5 h-5" />
                Authorize ${amount}
              </>
            )}
          </button>
        </div>
      </form>

      {isDev && (
        <div className="mt-8 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CreditCardIcon className="w-5 h-5 text-gray-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Card Info (Development Only)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-xs text-gray-600">Card Number: <code className="bg-gray-200 px-1 rounded">4242 4242 4242 4242</code></div>
            <div className="text-xs text-gray-600">Expiry/CVC: <code className="bg-gray-200 px-1 rounded">12/26 / 123</code></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
        <LockClosedIcon className="w-3 h-3" />
        <span>Payments secured by Stripe</span>
      </div>
    </div>
  )
}
