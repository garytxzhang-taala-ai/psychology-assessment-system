'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Bot, User, ArrowLeft, FileText } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
}

interface QuestionnaireResult {
  role: 'student' | 'parent'
  scores: {
    autonomy: number
    competence: number
    engagement: number
  }
  motivationType: {
    id: string
    name: string
    description: string
  }
  weakDimensions: string[]
  suggestions: Array<{
    title: string
    content: string
  }>
}

export default function ChatPage() {
  const initialMessages: ChatMessage[] = [
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是Jin Qi，你的学习心理专家。我已经了解了你的ACE动机画像，可以为你提供个性化的学习指导。\n\n有什么学习上的困惑或目标想要讨论吗？',
      timestamp: new Date().toISOString()
    }
  ]

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userResult, setUserResult] = useState<QuestionnaireResult | null>(null)
  const [useStreaming, setUseStreaming] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const savedResult = localStorage.getItem('questionnaire_result')
    if (savedResult) {
      try {
        setUserResult(JSON.parse(savedResult))
      } catch (error) {
        console.error('解析用户结果失败:', error)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 流式发送消息函数
  const handleSendMessageStream = async () => {
    if (!inputMessage.trim() || isLoading) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    }
    setMessages(prev => [...prev, aiMessage])

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userResult
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('无法读取响应流')
      }
      
      let accumulatedContent = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, isStreaming: false }
                  : msg
              ))
              setIsLoading(false)
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.content
              
              if (content) {
                accumulatedContent += content
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ))
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('流式发送消息失败:', error)
      let errorContent = '抱歉，我现在无法回复。请稍后再试。'

      if (error instanceof Error) {
        if (error.message?.includes('Failed to fetch')) {
          errorContent = '网络连接异常，请检查网络状态后重试。'
        } else if (error.name === 'AbortError') {
          errorContent = '请求超时，请重试。'
        }
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: errorContent, isStreaming: false }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  // 普通发送消息函数
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userResult
        })
      })

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const data = await response.json()
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || '抱歉，我现在无法回复。',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我现在无法回复。请稍后再试。',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      useStreaming ? handleSendMessageStream() : handleSendMessage()
    }
  }

  const quickQuestions = [
    '我最近对什么特别感兴趣？',
    '给我一个有挑战性的小任务',
    '我想探索长远的学习目标',
    '如何找到兴趣与学习的交集？'
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/results')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-3">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">Jin Qi - 学习心理专家</h1>
                <p className="text-sm text-gray-600">基于你的ACE动机画像提供个性化指导</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/results')}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            查看报告
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-primary-500' 
                        : 'bg-gradient-to-r from-primary-500 to-secondary-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white shadow-md border'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-5 bg-primary-500 ml-1 animate-pulse" />
                      )}
                    </div>
                    <div className={`text-xs mt-2 flex items-center justify-between ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                      {message.isStreaming && (
                        <span className="text-xs text-primary-500 flex items-center">
                          <div className="w-1 h-1 bg-primary-500 rounded-full mr-1 animate-bounce" />
                          <div className="w-1 h-1 bg-primary-500 rounded-full mr-1 animate-bounce" style={{animationDelay: '0.1s'}} />
                          <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                          <span className="ml-2">正在生成...</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex mr-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="bg-white shadow-md border px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="text-sm text-gray-600 mb-2">快速开始：</div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => setInputMessage(question)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t bg-white">
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入你的问题...（按Enter发送）"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setUseStreaming(!useStreaming)}
                  className={`px-3 py-3 text-sm rounded-lg transition-colors ${
                    useStreaming 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={useStreaming ? '流式模式' : '普通模式'}
                >
                  {useStreaming ? '🌊' : '📝'}
                </button>
                <button
                  onClick={useStreaming ? handleSendMessageStream : handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}