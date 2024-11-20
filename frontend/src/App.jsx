import React, { useEffect, useRef, useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import Homepage from '@/pages/Homepage/index.jsx';
import CompletePage from '@/pages/complete/index.jsx';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from 'axios';
import './App.css'

const stripePromise = loadStripe("pk_test_51KFuYNH6PcbFpUnVsjmzBbybOWTHdYfxTUoRV9mHMliS60CmIUPhODqdfsImPdnQr7W335fBPdDUENtRgDSBgbG800vndkJ6iL");

function App() {
  const [clientSecret, setClientSecret] = useState("");
  const [clientId, setClientId] = useState("")
  const isFetchRef = useRef(false)
  
  useEffect(() => {
    if (isFetchRef.current) return
    isFetchRef.current = true
    axios.post("http://127.0.0.1:8000/pay/createPayment", {
      amount: 400,
      currency: 'hkd'
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => {
      setClientSecret(res.data.clientSecret);
      setClientId(res.data.clientId)
    })
  }, [])

  const appearance = {
    theme: 'stripe',
  };
  // Enable the skeleton loader UI for optimal loading.
  const loader = 'auto';

  return (
    <Router>
      {
        clientSecret ?
          <Elements options={{ clientSecret, appearance, loader }} stripe={stripePromise}>
            <Routes>
              <Route path="/" element={<Homepage clientSecret={clientSecret} clientId={clientId} />} />
              <Route path="/complete" element={<CompletePage />} />
            </Routes>
          </Elements> : null
      }
    </Router>
  )
}

export default App
