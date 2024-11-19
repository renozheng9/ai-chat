import React, { useState, useEffect } from 'react'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from 'axios';
import CheckoutForm from "@/components/checkoutForm";
import Complete from "@/components/complete";
import "./index.css"

const stripePromise = loadStripe("pk_test_51KFuYNH6PcbFpUnVsjmzBbybOWTHdYfxTUoRV9mHMliS60CmIUPhODqdfsImPdnQr7W335fBPdDUENtRgDSBgbG800vndkJ6iL");

function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [dpmCheckerLink, setDpmCheckerLink] = useState("");
  const [isSuccess, setIsSuccess] = useState(false)
  const [amount, setAmount] = useState('')
  const [isConfirmAmount, setIsConfirmAmount] = useState(false)
  const [currency, setCurrency] = useState('hkd')

  function handleAmountChange(e) {
    setAmount(e.target.value)
  }

  function handleCurrencyChange(e) {
    setCurrency(e.target.value)
  }

  function handleConfirmAmount() {
    setIsConfirmAmount(true)
    axios.post("http://127.0.0.1:8000/pay/createPayment", {
      amount: amount,
      currency: currency
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => {
      setClientSecret(res.data.clientSecret);
      // [DEV] For demo purposes only
      setDpmCheckerLink(res.data.dpmCheckerLink);
    })
  }

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    // axios.post("http://127.0.0.1:8000/pay/createPayment", {
    //   amount: 1400
    // }, {
    //   headers: {
    //     "Content-Type": "application/json"
    //   }
    // }).then(res => {
    //   setClientSecret(res.data.clientSecret);
    //   // [DEV] For demo purposes only
    //   setDpmCheckerLink(res.data.dpmCheckerLink);
    // })
    // fetch("/create-payment-intent", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ items: [{ id: "xl-tshirt", amount: 1000 }] }),
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setClientSecret(data.clientSecret);
    //     // [DEV] For demo purposes only
    //     setDpmCheckerLink(data.dpmCheckerLink);
    //   });
  }, []);

  const appearance = {
    theme: 'stripe',
  };
  // Enable the skeleton loader UI for optimal loading.
  const loader = 'auto';

  return (
    <div className="flex flex-col justify-center items-center w-[100vw] h-[100vh]">
      {
        isConfirmAmount ? null :
          <div className="amount-input-wrapper flex flex-col gap-y-[8px] mb-[12px]">
            <div>
              捐赠金额
            </div>

            <input className="amount-input" type="number" value={amount} onChange={handleAmountChange} />

            <div className="mt-[18px]">
              货币
            </div>

            <select value={currency} onChange={handleCurrencyChange}>
              <option value="hkd">HKD</option>
              <option value="cny">CNY</option>
            </select>

            <button className="bg-[#0055DE] mt-[22px] px-[16px] py-[12px]" onClick={handleConfirmAmount}>
              <span id="button-text">
                确认
              </span>
            </button>
          </div>
      }
      {
        clientSecret ? (
          <Elements options={{ clientSecret, appearance, loader }} stripe={stripePromise}>
            {
              isSuccess ?
                <Complete /> :
                <CheckoutForm dpmCheckerLink={dpmCheckerLink} />
            }
            {/* <Routes>
          <Route path="/checkout" element={<CheckoutForm dpmCheckerLink={dpmCheckerLink} />} />
          <Route path="/complete" element={<CompletePage />} />
        </Routes> */}
          </Elements>
        ) : null
      }
    </div>
  );
}

export default Checkout