import React, { useEffect, useRef, useState } from "react";
import axios from 'axios'
import { ChakraProvider, Flex, Input, Button, Text, Icon } from '@chakra-ui/react'
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson } from 'react-icons/md';
import MessageBoxChat from '@/components/MessageBox';
import './index.css'

function Homepage() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [outputCode, setOutputCode] = useState('')
  const [inputText, setInputText] = useState('')

  const [messageList, setMessageList] = useState([])

  const scrollRef = useRef(null)

  function getReply() {
    const temp = [...messageList]
    setMessageList([
      ...temp,
      {
        role: 'user',
        text: inputText
      }
    ])
    axios({
      url: 'http://127.0.0.1:8000/chat/getReply',
      method: 'post',
      data: {
        text: inputText
      }
    }).then(res => {
      if (res.status === 200) {
        console.log(res)
        setMessageList([
          ...temp,
          {
            role: 'user',
            text: inputText
          },
          {
            role: 'ai',
            text: res.data
          }
        ])
      }
    }).catch(err => console.log(err))
  }

  function handleChange(e) {
    setInputText(e.target.value)
  }

  useEffect(() => {
    console.log(scrollRef.current.scrollTo)
    scrollRef.current.scrollTo({
      top: Number.MAX_SAFE_INTEGER,
      behavior: 'smooth'
    })
  }, [messageList])

  return (
    <div className="flex flex-col justify-between h-full max-w-[1280px] mx-auto my-0 py-[24px] px-[64px]">
      <div className="w-full h-[80vh] overflow-auto" ref={scrollRef}>
        <Flex
          direction="column"
          w="100%"
          mx="auto"
          display={'flex'}
          mb={'auto'}
          style={{ rowGap: '24px' }}
        >
          {
            messageList.map((item, index) => (
              item.role === 'user' ?
                (
                  <Flex w="100%" align={'center'} mb="10px" key={index}>
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
                      p="22px"
                      border="1px solid"
                      borderColor="#E2E8F0"
                      borderRadius="14px"
                      w="100%"
                      zIndex={'2'}
                    >
                      <Text
                        color="#1B254B"
                        fontWeight="600"
                        fontSize={{ base: 'sm', md: 'md' }}
                        lineHeight={{ base: '24px', md: '26px' }}
                      >
                        {item.text}
                      </Text>
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
                  <Flex w="100%" key={index}>
                    <MessageBoxChat output={item.text} />
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
      <div className="flex flex-row justify-between gap-x-[24px]">
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
            placeholder="Type your message here..."
            onChange={handleChange}
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
          Submit
        </Button>
      </div>
    </div>
  )
}

export default Homepage