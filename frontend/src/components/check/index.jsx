import React, { useState, useEffect } from 'react'
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
import axios from 'axios';
import CheckoutForm from "@/components/checkoutForm";
import "./index.css"

function Checkout({ clientSecret, clientId }) {
  const [amount, setAmount] = useState('')
  const [isConfirmAmount, setIsConfirmAmount] = useState(false)
  const [currency, setCurrency] = useState('hkd')
  const [errorTip, setErrorTip] = useState('')

  function handleAmountChange(e) {
    const value = e.target.value
    if (Number.isNaN(Number(value))) {
      setAmount('')
      return
    }
    setAmount(e.target.value)
  }

  function handleCurrencyChange(e) {
    setCurrency(e.target.value)
  }

  function handleConfirmAmount() {
    const temp = Number(amount)
    if (Number.isNaN(temp)) {
      setErrorTip('请输入合法数字')
      return
    }
    if (temp < 4 || temp > 999999) {
      setErrorTip('请输入4-999999之间的数字')
      return
    }

    setErrorTip('')

    let strAmount = ''
    const strTemp = String(amount)
    const arr = strTemp.split('.')
    if (arr?.[1]) {
      strAmount = `${arr[0]}.${arr[1].slice(0, 2)}`
    } else {
      strAmount = arr[0]
    }

    axios.post("http://127.0.0.1:8000/pay/updatePayment", {
      amount: Number(strAmount * 100),
      currency: currency,
      client: clientId
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => {
      if (res.status === 200) {
        setIsConfirmAmount(true)
      }
    }).catch(err => console.log(err))

    return

    // setIsConfirmAmount(true)
    // axios.post("http://127.0.0.1:8000/pay/createPayment", {
    //   amount: Number(strAmount * 100),
    //   currency: currency
    // }, {
    //   headers: {
    //     "Content-Type": "application/json"
    //   }
    // }).then(res => {
    //   setClientSecret(res.data.clientSecret);
    // })
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      {
        isConfirmAmount ? <CheckoutForm /> :
          <div className="amount-input-wrapper flex flex-col gap-y-[8px] mb-[12px]">
            <div>
              捐赠金额
            </div>

            <input className="amount-input" type="text" value={amount} onInput={handleAmountChange} />
            <div className="text-[rgb(245,63,63)]">{errorTip}</div>

            <div className="mt-[18px]">
              货币
            </div>

            <select value={currency} onChange={handleCurrencyChange}>
              <option value="usd">USD</option>
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
      {/* {
        clientSecret ? (
          <Elements options={{ clientSecret, appearance, loader }} stripe={stripePromise}>
            <CheckoutForm dpmCheckerLink={dpmCheckerLink} />
          </Elements>
        ) : null
      } */}
    </div>
  );
}

export default Checkout