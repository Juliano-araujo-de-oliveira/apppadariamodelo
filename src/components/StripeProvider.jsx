import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripeProvider = ({ children }) => {
  const options = {
    mode: 'payment',
    currency: 'brl',
    amount: 1000, // Amount is required for Elements provider, but will be overridden in checkout
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#8B6F47',
        colorBackground: '#1a1a1a',
        colorText: '#ffffff',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;