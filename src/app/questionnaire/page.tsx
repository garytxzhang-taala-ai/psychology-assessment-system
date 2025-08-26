'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { aceQuestions, parentQuestions, calculateACEScores } from '../../data/questions'
import { identifyMotivationType, getWeakDimensions } from '../../data/motivationTypes'
import { getPersonalizedSuggestions } from '../../data/suggestions'
import ProgressBar from '../../components/ProgressBar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { databaseService } from '../../utils/database'
import { generateReportId } from '../../utils/idGenerator'

function QuestionnaireContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get('role') as 'student' | 'parent'
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  // 用户信息已在登录时填写，无需重复收集
  
  const questions = role === 'student' ? aceQuestions : parentQuestions
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  
  useEffect(() => {
    // 检查用户是否已登录
    const user = localStorage.getItem('currentUser')
    if (!user) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(user)
    setCurrentUser(userData)

    if (!role) {
      router.push('/')
      return
    }
    
    // 尝试恢复之前的进度
    const progressKey = `questionnaire_progress_${role}_${userData.id}`
    const savedProgress = localStorage.getItem(progressKey)
    
    if (savedProgress) {
      const { questionIndex, responses: savedResponses } = JSON.parse(savedProgress)
      setCurrentQuestionIndex(questionIndex)
      setResponses(savedResponses)
    } else {
      // 如果没有保存的进度，从第一题开始
      setCurrentQuestionIndex(0)
      setResponses({})
    }

    // 用户信息已在登录时填写完成，无需重复填写
  }, [router, role])
  
  const handleAnswer = (value: number) => {
    const newResponses = {
      ...responses,
      [currentQuestion.id]: value
    }
    setResponses(newResponses)
    
    // 自动保存进度
    if (currentUser) {
      const progressKey = `questionnaire_progress_${role}_${currentUser.id}`
      const progressData = {
        questionIndex: currentQuestionIndex,
        responses: newResponses,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(progressKey, JSON.stringify(progressData))
    }
  }
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(newIndex)
      
      // 保存进度
      if (currentUser) {
        const progressKey = `questionnaire_progress_${role}_${currentUser.id}`
        const progressData = {
          questionIndex: newIndex,
          responses,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(progressKey, JSON.stringify(progressData))
      }
    } else {
      // 完成问卷，计算结果
      completeQuestionnaire()
    }
  }
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(newIndex)
      
      // 保存进度
      if (currentUser) {
        const progressKey = `questionnaire_progress_${role}_${currentUser.id}`
        const progressData = {
          questionIndex: newIndex,
          responses,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(progressKey, JSON.stringify(progressData))
      }
    }
  }
  
  // 用户信息提交逻辑已移除

  const completeQuestionnaire = async () => {
    const scores = calculateACEScores(responses)
    const motivationType = identifyMotivationType(scores)
    const weakDimensions = getWeakDimensions(scores)
    const suggestions = getPersonalizedSuggestions(motivationType.id, weakDimensions)
    
    // 生成独立的报告ID
    const reportId = generateReportId()
    
    // 保存结果到localStorage
    const result = {
      reportId,
      userId: currentUser.id,
      role,
      responses,
      scores,
      motivationType,
      weakDimensions,
      suggestions,
      timestamp: new Date().toISOString(),
      userInfo: JSON.parse(localStorage.getItem(`userInfo_${currentUser.id}`) || '{}')
    }
    
    localStorage.setItem(`testResults_${role}_${currentUser.id}`, JSON.stringify(result))
    
    // 清除进度数据，因为问卷已完成
    const progressKey = `questionnaire_progress_${role}_${currentUser.id}`
    localStorage.removeItem(progressKey)
    
    // 更新用户完成状态
    const updatedUser = {
      ...currentUser,
      [`${role}Completed`]: true
    }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    
    // 同时保存到数据库
    try {
      const dbResult = await databaseService.updateUserResults(currentUser.id, {
        [`${role}Results`]: result,
        [`${role}Completed`]: true
      })
      if (!dbResult.success) {
        console.warn('数据库保存失败:', dbResult.error)
      }
    } catch (error) {
      console.error('保存到数据库时出错:', error)
    }
    
    // 保存报告ID索引，用于历史查询
    const reportIndex = JSON.parse(localStorage.getItem('reportIndex') || '{}')
    reportIndex[reportId] = {
      userId: currentUser.id,
      type: role,
      timestamp: new Date().toISOString(),
      studentName: currentUser.studentName || '学生',
      parentName: currentUser.parentName || '家长'
    }
    localStorage.setItem('reportIndex', JSON.stringify(reportIndex))
    
    // 检查跳转逻辑
    if (role === 'student') {
      // 学生问卷完成后先显示学生详细报告
      // 设置标记表示需要显示学生详细报告
      localStorage.setItem('showStudentDetailFirst', 'true')
      router.push('/results?mode=student')
    } else if (role === 'parent') {
      // 家长问卷完成后，检查是否双方都已完成
      const studentResults = localStorage.getItem(`testResults_student_${currentUser.id}`)
      const parentResults = localStorage.getItem(`testResults_parent_${currentUser.id}`)
      
      if (studentResults && parentResults) {
        const studentData = JSON.parse(studentResults)
        const parentData = JSON.parse(parentResults)
        
        // 使用学生报告的ID作为综合报告ID
        const combinedReportId = studentData.reportId
        
        // 生成综合报告
        const combinedResults = {
          reportId: combinedReportId,
          student: studentData,
          parent: parentData,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(`combinedResults_${currentUser.id}`, JSON.stringify(combinedResults))
        
        // 更新报告ID索引，将学生报告类型更新为综合报告
        const reportIndex = JSON.parse(localStorage.getItem('reportIndex') || '{}')
        reportIndex[combinedReportId] = {
          userId: currentUser.id,
          type: 'combined',
          timestamp: new Date().toISOString(),
          studentName: currentUser.studentName || '学生',
          parentName: currentUser.parentName || '家长'
        }
        localStorage.setItem('reportIndex', JSON.stringify(reportIndex))
      }
      
      // 跳转到结果页面
      router.push('/results')
    }
  }
  
  const isCurrentQuestionAnswered = responses[currentQuestion?.id] !== undefined
  
  if (!role || !currentUser) {
    return <div>加载中...</div>
  }

  // 用户信息填写界面已移除，直接进入问卷
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 头部信息 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md mb-4">
            <span className="text-sm text-gray-600">
              {role === 'student' ? '学生' : '家长'}问卷
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ACE学习动机评估
          </h1>
          <p className="text-gray-600">
            请根据实际情况如实回答，共{questions.length}题
          </p>
        </div>
        
        {/* 进度条 */}
        <ProgressBar 
          current={currentQuestionIndex + 1} 
          total={questions.length} 
          className="mb-8"
        />
        
        {/* 问题卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">
              {currentQuestion?.dimension === 'autonomy' && '自主性维度'}
              {currentQuestion?.dimension === 'competence' && '胜任感维度'}
              {currentQuestion?.dimension === 'engagement' && '参与度维度'}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion?.text}
            </h2>
          </div>
          
          {/* 选项 */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  responses[currentQuestion.id] === option.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {responses[currentQuestion.id] === option.value && (
                    <CheckCircle className="w-5 h-5 text-primary-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* 导航按钮 */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-6 py-3 text-gray-600 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            上一题
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === questions.length - 1 ? '完成测评' : '下一题'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
        
        {/* 问题导航点 */}
        <div className="flex justify-center mt-8 space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentQuestionIndex
                  ? 'bg-primary-500'
                  : responses[questions[index].id]
                  ? 'bg-green-400'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <QuestionnaireContent />
    </Suspense>
  )
}