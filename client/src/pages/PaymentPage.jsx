import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import PaymentForm from '../components/PaymentForm';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const amount = 1000; // $10.00 in cents

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    axios.post('/api/payments/create-payment-intent', { items: [{ id: "donation" }], amount })
      .then((res) => setClientSecret(res.data.clientSecret));
  }, []);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <PaymentForm amount={amount} />
        </Elements>
      ) : (
        <div className="text-xl">Loading payment details...</div>
      )}
    </div>
  );
};

export default PaymentPage;
