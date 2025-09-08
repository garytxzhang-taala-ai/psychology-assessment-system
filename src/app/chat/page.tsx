'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Bot, User, ArrowLeft, FileText } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
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
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userResult, setUserResult] = useState<QuestionnaireResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // 获取用户测评结果
    const savedResult = localStorage.getItem('questionnaire_result')
    if (savedResult) {
      const result = JSON.parse(savedResult)
      setUserResult(result)
      
      // 添加欢迎消息
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `你好！我是Jin Qi，你的学习心理专家 🌟\n\n我看到你已经完成了ACE动机测评，显示你是「${result.motivationType.name}」类型的学习者。我很高兴能陪伴你一起探索学习的乐趣！\n\n我可以帮你：\n• 🎯 发现兴趣与学习的交集\n• 💪 设计有挑战性的小任务\n• 🌈 探索长远目标与学习意义\n\n让我们从一个简单的问题开始：最近有什么事情让你特别好奇或感兴趣的吗？`,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    } else {
      // 没有测评结果时的欢迎消息
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `你好！我是Jin Qi，你的学习心理专家 🌟\n\n欢迎来到AI深度解读！虽然你还没有完成ACE动机测评，但我依然很高兴能与你交流。\n\n我可以帮你：\n• 🎯 探索学习兴趣和动机\n• 💪 提供学习方法建议\n• 🌈 讨论学习目标和规划\n\n如果你想获得更个性化的指导，建议先完成ACE动机测评。现在，让我们开始聊天吧！有什么想要讨论的吗？`,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
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
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          })),
          studentContext: userResult ? {
            name: '学生',
            motivationType: userResult.motivationType,
            scores: userResult.scores,
            weakDimensions: userResult.weakDimensions,
            suggestions: userResult.suggestions
          } : null
        }),
      })

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const data = await response.json()
      
      if (data.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error || '获取AI回复失败')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      let errorContent = '抱歉，我现在无法回复。请稍后再试。'

      if (error instanceof Error) {
        if (error.message?.includes('Failed to fetch')) {
          errorContent = '网络连接异常，请检查网络状态后重试。如果问题持续，请刷新页面。'
        } else if (error.message?.includes('网络请求失败')) {
          errorContent = '服务暂时不可用，正在使用备用回复。如需完整AI分析，请稍后重试。'
        }
      }
      
      const errorMessage: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'assistant',
         content: errorContent,
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
      handleSendMessage()
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
      {/* 头部 */}
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
      
      {/* 聊天区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* 头像 */}
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
                  
                  {/* 消息内容 */}
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white shadow-md border'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 加载指示器 */}
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
          
          {/* 快捷问题 */}
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
          
          {/* 输入区域 */}
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
              <button
                onClick={handleSendMessage}
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
  )
}