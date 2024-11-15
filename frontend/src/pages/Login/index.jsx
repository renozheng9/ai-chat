import React, { useState } from "react";
import { login } from '@/api/login'
import { setStorage, KEY_TOKEN } from "@/utils/storage";


function Login() {
  const [isLogin, setIsLogin] = useState(true)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleToggle() {
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setIsLogin(!isLogin)
  }

  function handleInputUsername(e) {
    console.log(e.target.value)
    setLoginUsername(e.target.value)
  }

  function handleInputPassword(e) {
    console.log(e.target.value)
    setLoginPassword(e.target.value)
  }

  function handleInputConfirmPassword(e) {
    console.log(e.target.value)
    setConfirmPassword(e.target.value)
  }

  function handleLogin() {
    login({
      username: loginUsername,
      password: loginPassword
    }).then(res => {
      console.log(res)
      if (res.status === 200) {
        // setStorage(KEY_TOKEN, res.data.access_token)
      } else {
        console.log('登录失败')
      }
    }).catch(err => {
      console.log(err)
      if (err.status === 401) {
        console.log('用户名或密码错误')
      } else {
        console.log('登录失败')
      }
    })
  }

  function handleRegist() {

  }

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      <div className="flex flex-col justify-center items-center bg-white h-[100vh]">
        <div
          className="mx-auto flex w-full flex-col justify-center pt-0 md:h-[unset] lg:h-[100vh] min-h-[100vh]">
          <div
            className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] w-[350px] max-w-[450px] mx-auto md:max-w-[450px] lg:mt-[130px] lg:max-w-[450px]">
            <p className="text-[32px] font-bold text-zinc-950 dark:text-white">{isLogin ? 'Sign In' : 'Regist'}</p>
            <div className="relative my-4">
              <div className="relative flex items-center py-1">
                <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
                <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
              </div>
            </div>
            <div>
              <form novalidate="" className="mb-4">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label className="text-zinc-950 dark:text-white"
                      for="email">Email</label>
                    <input
                      className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-0 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-400"
                      id="email" placeholder="name@example.com" type="email" autocapitalize="none"
                      autocomplete="email" autocorrect="off" name="email" onChange={handleInputUsername} />
                    <label
                      className="text-zinc-950 mt-2 dark:text-white" for="password" onChange={handleInputPassword}>Password</label>
                    <input
                      id="password" placeholder="Password" type="password"
                      autocomplete="current-password"
                      className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-0 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-400"
                      name="password" />
                    {
                      isLogin ? null :
                        (
                          <>
                            <label
                              className="text-zinc-950 mt-2 dark:text-white" for="confirmPassword" onChange={handleInputConfirmPassword}>Confirm Password</label>
                            <input
                              id="confirmPassword" placeholder="Confirm Password" type="password"
                              autocomplete="current-password"
                              className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-0 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-400"
                              name="confirmPassword" onChange={handleInputConfirmPassword} />
                          </>
                        )
                    }
                  </div>
                  <button className="whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 mt-2 flex h-[unset] w-full items-center justify-center rounded-lg px-4 py-4 text-sm font-medium bg-[rgb(9,9,11)] text-white" type="submit">Sign in</button>
                </div>
              </form>
              <p className="flex flex-row justify-end"><a
                className="font-medium text-zinc-950 text-[rgba(22,93,255,1)] text-sm cursor-pointer" onClick={handleToggle}>{isLogin ? 'To regist' : 'To login'}</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* {
        isLogin ?
          (
            <div className="flex flex-col gap-y-[12px]">
              <label>用户名: <input type="text" onChange={handleLoginInputUsername} /></label>
              <label>密码: <input type="password" onChange={handleLoginInputPassword} /></label>
              <button onClick={handleLogin}>登录</button>

              <div className="mt-[16px] w-full text-center" onClick={handleToggle}>
                {isLogin ? '去注册' : '去登录'}
              </div>
            </div>
          ) :
          (
            <div>
              <label>用户名: <input type="text" onChange={handleRegistInputUsername} /></label>
              <label>密码: <input type="password" onChange={handleRegistInputPassword} /></label>
              <label>确认密码: <input type="password" onChange={handleRegistInputConfirmPassword} /></label>
              <button onClick={handleRegist}>注册</button>

              <div className="mt-[16px] w-full text-center" onClick={handleToggle}>
                {isLogin ? '去注册' : '去登录'}
              </div>
            </div>
          )
      } */}

    </div>
  )
}

export default Login