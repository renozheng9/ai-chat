import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import Recorder from 'recorder-core'
import 'recorder-core/src/engine/mp3'
import 'recorder-core/src/engine/mp3-engine'
import { ChakraProvider, Flex, Input, Button, Text, Icon } from '@chakra-ui/react'
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson } from 'react-icons/md';
import MessageBoxChat from '@/components/MessageBox';
import Wave from '@/components/Wave'
import ICON_RECORD from '@/assets/record.svg'
import ICON_LIKE from '@/assets/like.svg'
import './index.css'

function Homepage() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [outputCode, setOutputCode] = useState('')
  const [inputText, setInputText] = useState('')

  const [messageList, setMessageList] = useState([
    {
      role: 'system',
      text: '像一位非常理解和支持的認知行為治療師一樣回答，為他們的情緒提供情緒緩解和支持。在確保安全的情況下，始終盡可能提供有幫助的答案。這對他們的情緒非常重要',
      // text: '假设你是一名心理咨询师，现在有一位病人向你咨询，这位病人刚刚失恋，很难过，请你为该病人进行心理咨询，注意回答尽量具体一些。（这一段话不需要做回复）',
      audio: '',
      isPlaying: false
    }
  ])

  const [canRecord, setCanRecord] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  
  const [score, setScore] = useState(0)
  const [isShowScore, setIsShowScore] = useState(false)

  const scrollRef = useRef(null)
  const recorder = useRef(null)
  const audioPlayerRef = useRef(null)

  const nowPlayingUrlRef = useRef('')

  const timerRef = useRef(0)
  const historyRef = useRef([])

  const renderMessageList = useMemo(() => messageList.filter(item => ['user', 'assistant'].includes(item.role)), [messageList])

  function getHistory() {
    // const history = []
    // for (let i = 0; i < messageList.length; i += 2) {
    //   const temp = []
    //   if (messageList[i]) {
    //     temp.push(messageList[i].text)
    //   }
    //   if (messageList[i + 1]) {
    //     temp.push(messageList[i + 1].text)
    //   }
    //   if (temp.length > 0) {
    //     history.push(temp)
    //   }
    // }
    // return history
    return historyRef.current.map(item => ({
      role: item.role,
      content: item.text
    }))
  }

  function getReply() {
    const text = inputText
    setInputText('')
    const temp = [...messageList]
    const tempAfterUser = [
      ...temp,
      {
        id: temp.length + 1,
        role: 'user',
        text: text,
        audio: '',
        isPlaying: false
      }
    ]
    setMessageList(tempAfterUser)
    historyRef.current = tempAfterUser
    const history = getHistory(tempAfterUser)
    axios({
      url: 'http://127.0.0.1:8000/chat/getTextReply',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        text: inputText,
        history: history
      }
    }).then(res => {
      if (res.status === 200) {
        console.log(res)
        const newMessageList = [
          ...temp,
          {
            id: temp.length + 1,
            role: 'user',
            text: text,
            audio: '',
            isPlaying: false
          },
          {
            id: temp.length + 2,
            role: 'assistant',
            text: res.data.text || '',
            audio: res.data?.audio || '',
            isPlaying: false
          }
        ]
        setMessageList(newMessageList)
        historyRef.current = newMessageList
      }
    }).catch(err => console.log(err))
  }

  function handleChange(e) {
    setInputText(e.target.value)
  }

  function handleBeginRecord() {
    recorder.current.open(function () {
      setCanRecord(true)
      setIsRecording(true)
      recorder.current.start()
    }, function (msg, isUserNotAllow) {
      console.log((isUserNotAllow ? "UserNotAllow，" : "") + "无法录音:" + msg);
    })
    // setIsRecording(true)
    // recorder.current.start()
  }

  function handleStopRecord() {
    recorder.current.stop(async function (blob, duration) {

      //简单利用URL生成本地文件地址，注意不用了时需要revokeObjectURL，否则霸占内存
      //此地址只能本地使用，比如赋值给audio.src进行播放，赋值给a.href然后a.click()进行下载（a需提供download="xxx.mp3"属性）
      // recordData.current = await blobToBase64(blob)
      // var localUrl = (window.URL || window.webkitURL).createObjectURL(blob);
      // console.log(blob, localUrl, "时长:" + duration + "ms");
      recorder.current.close();//释放录音资源，当然可以不释放，后面可以连续调用start；但不释放时系统或浏览器会一直提示在录音，最佳操作是录完就close掉
      // recorder.current = null;
      console.log(blob)
      const tempUrl = URL.createObjectURL(blob)
      const temp = [...messageList]

      const newMessageList = [
        ...temp,
        {
          id: temp.length + 1,
          role: 'user',
          text: '',
          audio: URL.createObjectURL(blob),
          isPlaying: false
        }
      ]
      setMessageList(newMessageList)
      historyRef.current = newMessageList

      const file = new File([blob], 'audio.wav', { type: 'audio/wav' })
      const formData = new FormData()
      formData.append('file', file)
      
      axios.post('http://127.0.0.1:8000/chat/getAudioTranslation', formData).then(translationRes => {
        console.log(translationRes)
        if (translationRes.status == 200) {
          const tempAfterUser = [
            ...temp,
            {
              id: temp.length + 1,
              role: 'user',
              text: translationRes.data.text,
              audio: tempUrl,
              isPlaying: messageList.find(item => item.id === temp.length + 1)?.isPlaying || false
            }
          ]

          setMessageList(tempAfterUser)
          historyRef.current = tempAfterUser
          const history = getHistory(tempAfterUser)

          axios.post('http://127.0.0.1:8000/chat/getAudioReply', {
            text: translationRes.data.text,
            spk: translationRes.data.spk,
            history
          }, {
            'headers': {
              'Content-Type': 'application/json'
            }
          }).then(audioReplyRes => {
            console.log(audioReplyRes)
            if (audioReplyRes.status === 200) {
              const newMessageList = [
                ...temp,
                {
                  id: temp.length + 1,
                  role: 'user',
                  text: translationRes.data.text,
                  audio: tempUrl,
                  isPlaying: messageList.find(item => item.id === temp.length + 1)?.isPlaying || false
                },
                {
                  id: temp.length + 2,
                  role: 'assistant',
                  text: audioReplyRes.data.text,
                  audio: audioReplyRes.data.url,
                  isPlaying: false
                }
              ]
              setMessageList(newMessageList)
              historyRef.current = newMessageList
            }
          }).catch(err => {
            console.log(err)
          })
        }
      }).catch(err => {
        console.log(err)
      })
      setIsRecording(false)
    }, function (msg) {
      console.log("录音失败:" + msg);
      recorder.current.close();//可以通过stop方法的第3个参数来自动调用close
      setIsRecording(false)
      // recorder.current = null;
    });
  }

  function handleRecord() {
    if (isRecording) {
      handleStopRecord()
    } else {
      handleBeginRecord()
    }
  }

  function handleAuthRecord() {
    if (recorder.current) return
    recorder.current = Recorder({
      type: 'mp3',
      sampleRate: 16000,
      bitRate: 16,
    })

    recorder.current.open(function () {
      setCanRecord(true)
    }, function (msg, isUserNotAllow) {
      console.log((isUserNotAllow ? "UserNotAllow，" : "") + "无法录音:" + msg);
    })
  }

  function handleItemAudioClick(data) {
    console.log(data)
    const temp = [...messageList]
    const chooseItem = temp.find(item => item.id === data.id)
    if (!chooseItem) return
    const playingItem = temp.find(item => item.isPlaying)
    const isPlaying = chooseItem.isPlaying
    chooseItem.isPlaying = !isPlaying
    if (playingItem) {
      playingItem.isPlaying = false
    }
    setMessageList(temp)
    historyRef.current = temp
    if (playingItem || isPlaying) {
      audioPlayerRef.current.pause()
    }

    if (!isPlaying) {
      nowPlayingUrlRef.current = data.audio
      audioPlayerRef.current.src = data.audio
      audioPlayerRef.current.play()
    }
  }

  const handleSentiment = useCallback(() => {
    const history = getHistory(messageList)
    axios.post('http://127.0.0.1:8000/chat/getSentiment', {
      history
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status === 200) {
        if (res.data.pos + res.data.neg === 0) {
          setScore(0)
        } else {
          setScore(Math.floor(res.data.pos * 100 / (res.data.pos + res.data.neg)))
        }
        
        setIsShowScore(true)
      }
    }).catch(err => {
      console.log(err)
    })
  }, [messageList])

  const handleEnd = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = 0

    handleSentiment()
  }, [messageList])

  function handleDonate() {
    navigate("/checkout")
  }

  useEffect(() => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio()
    }

    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        handleSentiment()
      }, 60 * 1000)
    }

    return () => {
      recorder.current?.close?.()
      recorder.current = null
      audioPlayerRef.current?.pause?.()
      audioPlayerRef.current = null
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    console.log(scrollRef.current.scrollTo)
    scrollRef.current.scrollTo({
      top: Number.MAX_SAFE_INTEGER,
      behavior: 'smooth'
    })
    audioPlayerRef.current.onended = function () {
      console.log(nowPlayingUrlRef.current)
      const temp = [...messageList]
      const playingItem = temp.find(item => item.audio === nowPlayingUrlRef.current)
      if (playingItem) {
        playingItem.isPlaying = false
        setMessageList(temp)
        historyRef.current = temp
        nowPlayingUrlRef.current = ''
      }
    }
  }, [messageList])

  return (
    <div className="flex flex-col justify-between max-w-[1280px] mx-auto my-0 pt-[16px] pb-[24px] px-[64px]">
      {/* <div onClick={handleTest}>click</div> */}
      
      <div className="w-full flex flex-row justify-between">
        <div className="bg-[rgb(247,101,96)] h-fit px-[12px] py-[6px] rounded-[8px] text-white w-fit cursor-pointer" onClick={handleEnd}>结束</div>
        
        <div className="w-fit mx-auto flex flex-col items-center">
          {
            isShowScore ?
              <div className="h-[64px] bg-[#950bd3] px-[18px] rounded-[10px] flex justify-center items-center text-[20px] text-[white] font-bold w-fit">{`你的開心指數：${score}%`}</div> : null
          }
        </div>
        <div>

          <div className="flex flex-col items-end">
            <div className="mt-[16px] bg-[#f5bf5e] px-[12px] py-[6px] rounded-[8px] text-white w-fit cursor-pointer flex flex-row items-center gap-x-[8px]" onClick={handleDonate}>
              <img src={ICON_LIKE} className="w-[20px]" />
              立即捐款
            </div>
            <div className="mt-[6px]">所有人的精神健康都值得重视</div>
          </div>
        </div>
      </div>

      <div className="w-full h-[70vh] overflow-auto" ref={scrollRef}>
        <Flex
          direction="column"
          w="100%"
          mx="auto"
          display={'flex'}
          mb={'auto'}
          style={{ rowGap: '24px' }}
        >
          {
            renderMessageList.map((item, index) => (
              item.role === 'user' ?
                (
                  <Flex align={'center'} mb="10px" key={index}>
                    <Flex
                      borderRadius="full"
                      justify="center"
                      align="center"
                      bg={'transparent'}
                      border="1px solid"
                      borderColor="#E2E8F0"
                      me="20px"
                      h="40px"
                      minH="40px"
                      minW="40px"
                    >
                      <Icon
                        as={MdPerson}
                        width="20px"
                        height="20px"
                        color="#422AFB"
                      />
                    </Flex>
                    <Flex
                      px="22px"
                      py={item.audio ? '0px' : '18px'}
                      minH="60px"
                      border="1px solid"
                      borderColor="#E2E8F0"
                      borderRadius="14px"
                      zIndex={'2'}
                    >
                      {
                        item.audio ?
                          <div className="h-full min-h-[60px] flex flex-row items-center" onClick={() => handleItemAudioClick(item)}>
                            <Wave isPlaying={item.isPlaying} />

                          </div>
                           :
                          <Text
                            color="#1B254B"
                            fontWeight="600"
                            fontSize={{ base: 'sm', md: 'sm' }}
                            lineHeight={{ base: '24px', md: '24px' }}
                          >
                            {item.text}
                          </Text>
                      }
          
                      {/* <Icon
                  cursor="pointer"
                  as={MdEdit}
                  ms="auto"
                  width="20px"
                  height="20px"
                  color={gray}
                /> */}
                    </Flex>
                  </Flex>
                ) : (
                  <Flex w="100%" justify="end" key={index}>
                    <MessageBoxChat data={item} onItemAudioClick={handleItemAudioClick} />
                    <Flex
                      borderRadius="full"
                      justify="center"
                      align="center"
                      bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
                      ml="20px"
                      h="40px"
                      minH="40px"
                      minW="40px"
                    >
                      <Icon
                        as={MdAutoAwesome}
                        width="20px"
                        height="20px"
                        color="white"
                      />
                    </Flex>
                  </Flex>
                )
            ))
          }
        </Flex>
      </div>
      <div className="mt-[24px] flex flex-row justify-between gap-x-[24px]">
        <div className="flex-1">
          <Input
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor="#E2E8F0"
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            color="#1B254B"
            _placeholder={{ color: '#86909C' }}
            placeholder="请输入..."
            onChange={handleChange}
            value={inputText}
          />
        </div>
        <Button
          variant="primary"
          py="20px"
          px="16px"
          fontSize="sm"
          borderRadius="45px"
          ms="auto"
          w={{ base: '120px', md: '120px' }}
          h="54px"
          _hover={{
            boxShadow:
              '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
            bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
            _disabled: {
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
            },
          }}
          onClick={getReply}
          isLoading={loading ? true : false}
        >
          发送
        </Button>
        {
          canRecord ?
            <div className="h-full flex justify-center items-center border-[1px] border-[#950bd3] rounded-[50%] px-[16px]" onClick={handleRecord}>
              {
                isRecording ?
                  <div className="w-[24px] h-[24px] bg-[#950bd3]"></div> :
                  <img src={ICON_RECORD} className="w-[24px] h-[24px]" />
              }
            </div> :
            <Button
              variant="primary"
              py="20px"
              px="16px"
              fontSize="sm"
              borderRadius="45px"
              ms="auto"
              w={{ base: '120px', md: '120px' }}
              h="54px"
              _hover={{
                boxShadow:
                  '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
                _disabled: {
                  bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
                },
              }}
              onClick={handleAuthRecord}
            >
              授权录音
            </Button>
        }
        {/* <div onClick={handleAuthRecord}>授权录音</div> */}
        {/* <div onClick={handleBeginRecord}>录音</div>
        <div onClick={handleStopRecord}>停止录音</div> */}
      </div>

      {/* <div className="bg-[rgb(247,101,96)] px-[12px] py-[6px] rounded-[8px] text-white w-fit fixed left-[24px] top-[12px] cursor-pointer" onClick={handleEnd}>结束</div> */}

      {/* {
        isShowScore ?
          <div className="fixed h-[64px] bg-[#950bd3] px-[18px] rounded-[10px] flex justify-center items-center text-[20px] text-[white] font-bold right-[20px] w-fit left-0 right-0 mx-auto top-[16px]">{`你的開心指數：${score}%`}</div> : null
      } */}

      {/* <div className="w-fit fixed top-[16px] right-0 left-0 mx-auto flex flex-col items-center">
        {
          isShowScore ?
            <div className="h-[64px] bg-[#950bd3] px-[18px] rounded-[10px] flex justify-center items-center text-[20px] text-[white] font-bold w-fit">{`你的開心指數：${score}%`}</div> : null
        }
      </div>

      <div className="fixed top-[16px] right-[16px] flex flex-col items-end">
        <div className="mt-[16px] bg-[#f5bf5e] px-[12px] py-[6px] rounded-[8px] text-white w-fit cursor-pointer text-[22px] flex flex-row items-center gap-x-[8px]" onClick={handleDonate}>
          <img src={ICON_LIKE} className="w-[20px]" />
          立即捐款
        </div>
        <div className="mt-[6px]">你的捐款能協助我們確保在香港任何人也毋須獨自面對精神健康問題。</div>
      </div> */}

      <div className="w-full h-[100vh]">
        <div className="w-full h-full"></div>
      </div>
    </div>
  )
}

export default Homepage