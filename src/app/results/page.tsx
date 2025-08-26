'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Download, MessageCircle, RotateCcw, Share2, Brain, User, ArrowRight, Target, TrendingUp, Users, Eye, BarChart3, FileText, Lightbulb } from 'lucide-react'
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'
import RadarChart from '../../components/RadarChart'
import AIExpertEvaluation from '../../components/AIExpertEvaluation'
import { identifyMotivationType } from '../../data/motivationTypes'
import { getPersonalizedSuggestions } from '../../data/suggestions'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface QuestionnaireResult {
  reportId?: string
  userId?: string
  role: 'student' | 'parent'
  responses: Record<string, number>
  scores: {
    autonomy: number
    competence: number
    engagement: number
  }
  motivationType: {
    id: string
    name: string
    description: string
    characteristics: string[]
    strengths: string[]
    challenges: string[]
    icon: string
  }
  weakDimensions: string[]
  suggestions: Array<{
    id: string
    title: string
    content: string
    type: string
    dimension?: string
    keywords: string[]
    priority: string
  }>
  timestamp: string
  userInfo?: any
}

interface CombinedResults {
  reportId?: string
  student: QuestionnaireResult
  parent: QuestionnaireResult
  timestamp: string
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<QuestionnaireResult | null>(null)
  const [combinedResults, setCombinedResults] = useState<CombinedResults | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'combined' | 'student'>('combined')
  
  // 判断是否是从学生问卷完成后直接跳转过来的
  const [isFromStudentQuestionnaire, setIsFromStudentQuestionnaire] = useState(false)
  
  // AI专家评价相关状态
  const [aiExpertEvaluation, setAiExpertEvaluation] = useState<string>('')
  const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false)
  const [evaluationError, setEvaluationError] = useState<string>('')

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (!user) {
      // 用户未登录，跳转到登录页面
      router.push('/login')
      return
    }
    
    const userData = JSON.parse(user)
    setCurrentUser(userData)
    
    // 设置是否是从学生问卷完成后直接跳转过来的
    const showStudentDetailFirstFlag = localStorage.getItem('showStudentDetailFirst')
    setIsFromStudentQuestionnaire(!!showStudentDetailFirstFlag)
    
    // 检查URL参数决定视图模式
    const view = searchParams.get('view')
    const mode = searchParams.get('mode')
    
    if (mode === 'student' || view === 'student') {
      // 显示学生详细报告
      let studentData = null
      
      if (showStudentDetailFirstFlag) {
        // 从学生问卷完成后直接跳转过来
        const studentResult = localStorage.getItem(`testResults_student_${userData.id}`)
        if (studentResult) {
          studentData = JSON.parse(studentResult)
        }
      } else if (searchParams.get('from') === 'history') {
        // 从历史页面跳转过来的学生详细报告
        const tempStudentReport = localStorage.getItem('temp_studentDetailReport')
        if (tempStudentReport) {
          studentData = JSON.parse(tempStudentReport)
          // 清除临时数据
          localStorage.removeItem('temp_studentDetailReport')
        }
      } else {
        // 从综合报告页面跳转过来，或者其他情况
        const studentDetailReport = localStorage.getItem('studentDetailReport')
        if (studentDetailReport) {
          studentData = JSON.parse(studentDetailReport)
          // 使用后清除数据，避免重复使用
          localStorage.removeItem('studentDetailReport')
        }
      }
      
      if (studentData) {
        setResult(studentData)
        setViewMode('student')
        setLoading(false)
        return
      } else {
        // 如果没有学生详细报告数据，尝试从原始测评结果获取
        const studentResult = localStorage.getItem(`testResults_student_${userData.id}`)
        if (studentResult) {
          studentData = JSON.parse(studentResult)
          setResult(studentData)
          setViewMode('student')
          setLoading(false)
          return
        }
        
        // 如果仍然没有数据，回到综合报告
        console.warn('未找到学生详细报告数据，返回综合报告')
        router.push('/results')
        return
      }
    }
    
    // 默认显示综合报告或单个报告
    setViewMode('combined')
    
    // 优先检查综合报告
    const combinedKey = `combinedResults_${userData.id}`
    const combined = localStorage.getItem(combinedKey)
    
    if (combined) {
      setCombinedResults(JSON.parse(combined))
      setLoading(false)
      return
    }
    
    // 如果没有综合报告，检查单个结果
    const studentKey = `testResults_student_${userData.id}`
    const parentKey = `testResults_parent_${userData.id}`
    
    const studentResult = localStorage.getItem(studentKey)
    const parentResult = localStorage.getItem(parentKey)
    
    if (studentResult) {
      setResult(JSON.parse(studentResult))
    } else if (parentResult) {
      setResult(JSON.parse(parentResult))
    } else {
      // 检查旧格式的结果
      const oldResult = localStorage.getItem('questionnaireResult')
      if (oldResult) {
        setResult(JSON.parse(oldResult))
      }
    }
    
    setLoading(false)
  }, [router, searchParams])

  // 生成AI专家评价
  const generateAIExpertEvaluation = async (studentResult: QuestionnaireResult, parentResult: QuestionnaireResult) => {
    if (isGeneratingEvaluation || aiExpertEvaluation) return
    
    setIsGeneratingEvaluation(true)
    setEvaluationError('')
    
    try {
      const response = await fetch('/api/ai/expert-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: currentUser?.name || '学生',
          student_ace: studentResult.scores,
          parent_ace: parentResult.scores,
          student_motivation_type: studentResult.motivationType.name,
          parent_motivation_type: parentResult.motivationType.name,
          observation: `学生动机类型：${studentResult.motivationType.name}，家长认知的动机类型：${parentResult.motivationType.name}。学生在自主性、胜任感、参与度方面的得分分别为${studentResult.scores.autonomy}、${studentResult.scores.competence}、${studentResult.scores.engagement}分，家长的评价分别为${parentResult.scores.autonomy}、${parentResult.scores.competence}、${parentResult.scores.engagement}分。`
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAiExpertEvaluation(data.data.evaluation)
      } else {
        setEvaluationError(data.error || '生成专家评价失败')
      }
    } catch (error) {
      console.error('生成AI专家评价失败:', error)
      setEvaluationError('网络错误，请稍后重试')
    } finally {
      setIsGeneratingEvaluation(false)
    }
  }
  
  // 当有综合结果时自动生成AI评价
  useEffect(() => {
    if (combinedResults && !aiExpertEvaluation && !isGeneratingEvaluation) {
      generateAIExpertEvaluation(combinedResults.student, combinedResults.parent)
    }
  }, [combinedResults, aiExpertEvaluation, isGeneratingEvaluation])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!result && !combinedResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">未找到测评结果</h2>
          <p className="text-gray-600 mb-6">请先完成问卷测评</p>
          <button
            onClick={() => router.push('/questionnaire')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            开始测评
          </button>
        </div>
      </div>
    )
  }

  const getRadarData = (resultData: QuestionnaireResult) => [
    {
      dimension: '自主性',
      score: resultData.scores.autonomy,
      fullMark: 20
    },
    {
      dimension: '胜任感',
      score: resultData.scores.competence,
      fullMark: 20
    },
    {
      dimension: '参与度',
      score: resultData.scores.engagement,
      fullMark: 20
    }
  ]

  const getComparisonData = () => {
    if (!combinedResults) return []
    
    return [
      {
        dimension: '自主性',
        student: combinedResults.student.scores.autonomy,
        parent: combinedResults.parent.scores.autonomy,
        fullMark: 20
      },
      {
        dimension: '胜任感',
        student: combinedResults.student.scores.competence,
        parent: combinedResults.parent.scores.competence,
        fullMark: 20
      },
      {
        dimension: '参与度',
        student: combinedResults.student.scores.engagement,
        parent: combinedResults.parent.scores.engagement,
        fullMark: 20
      }
    ]
  }

  const radarData = result ? getRadarData(result) : []
  const comparisonData = getComparisonData()

  const handleStartChat = () => {
    router.push('/chat')
  }

  const handleViewStudentReport = () => {
    if (!combinedResults || !currentUser) return
    
    // 保存学生报告数据到localStorage，供详细报告页面使用
    const studentReportData = {
      ...combinedResults.student,
      reportId: combinedResults.reportId,
      userInfo: combinedResults.student.userInfo || currentUser
    }
    
    localStorage.setItem('studentDetailReport', JSON.stringify(studentReportData))
    
    // 导航到学生详细报告页面
    router.push('/results?mode=student')
  }

  const handleBackToCombined = () => {
    // 清除学生详细报告数据（如果还存在的话）
    localStorage.removeItem('studentDetailReport')
    // 返回综合报告
    router.push('/results')
  }

  const handleContinueParentQuestionnaire = () => {
    // 清除学生详细报告首次显示标记
    localStorage.removeItem('showStudentDetailFirst')
    // 跳转到家长问卷
    router.push('/questionnaire?role=parent')
  }

  const handleExportReport = async () => {
    try {
      const element = document.getElementById('results-content')
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 30

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      const fileName = combinedResults 
        ? `学习动机综合分析报告_${combinedResults.student.userInfo?.studentName || '学生'}_${new Date().toLocaleDateString()}.pdf`
        : `学习动机分析报告_${new Date().toLocaleDateString()}.pdf`
      
      pdf.save(fileName)
    } catch (error) {
      console.error('导出PDF失败:', error)
      alert('导出失败，请重试')
    }
  }

  const handleRetakeTest = () => {
    if (combinedResults) {
      localStorage.removeItem(`combined_results_${currentUser?.username}`)
      localStorage.removeItem(`questionnaire_result_${currentUser?.username}_student`)
      localStorage.removeItem(`questionnaire_result_${currentUser?.username}_parent`)
    } else {
      localStorage.removeItem('questionnaireResult')
    }
    router.push('/questionnaire')
  }

  const getDimensionName = (dimension: string) => {
    const dimensionMap: Record<string, string> = {
      autonomy: '自主性',
      competence: '胜任感',
      engagement: '参与度'
    }
    return dimensionMap[dimension] || dimension
  }

  // ACE维度详细描述函数
  const getAutonomyDescription = (score: number): string => {
    if (score >= 16) return '您在学习中表现出很强的自主性，能够主动规划和控制自己的学习过程'
    if (score >= 12) return '您具有一定的学习自主性，但在某些方面还可以进一步提升'
    if (score >= 8) return '您的学习自主性处于中等水平，需要在自我管理方面加强'
    return '您在学习自主性方面还有很大提升空间，建议从小目标开始培养自主学习习惯'
  }

  const getAutonomyBehavior = (score: number): string => {
    if (score >= 16) return '能够自主制定学习计划，主动寻找学习资源，对学习内容有自己的选择和判断'
    if (score >= 12) return '大部分时候能够自主学习，但偶尔需要外部提醒和督促'
    if (score >= 8) return '在熟悉的学习任务中能表现出一定自主性，但面对新挑战时容易依赖他人指导'
    return '学习主要依赖外部安排和督促，较少主动规划和管理自己的学习'
  }

  const getCompetenceDescription = (score: number): string => {
    if (score >= 16) return '您对自己的学习能力很有信心，能够积极面对学习挑战'
    if (score >= 12) return '您对自己的学习能力有一定信心，但在某些领域可能还不够自信'
    if (score >= 8) return '您的学习自信心处于中等水平，需要通过更多成功体验来提升'
    return '您在学习自信心方面需要加强，建议从简单任务开始建立成就感'
  }

  const getCompetenceBehavior = (score: number): string => {
    if (score >= 16) return '面对学习困难时能保持积极态度，相信通过努力能够克服挑战'
    if (score >= 12) return '在擅长的领域表现自信，但在不熟悉的领域可能会有些犹豫'
    if (score >= 8) return '需要他人鼓励才能保持学习信心，容易因为小挫折而怀疑自己'
    return '经常怀疑自己的学习能力，容易放弃，需要更多支持和鼓励'
  }

  const getEngagementDescription = (score: number): string => {
    if (score >= 16) return '您对学习充满热情，能够深度投入到学习活动中'
    if (score >= 12) return '您对学习有一定兴趣，但投入程度可能因内容而异'
    if (score >= 8) return '您的学习参与度处于中等水平，需要找到更多学习的乐趣'
    return '您对学习的兴趣和投入度较低，需要发现学习的意义和价值'
  }

  const getEngagementBehavior = (score: number): string => {
    if (score >= 16) return '主动参与课堂讨论，课后会深入思考和探索相关内容'
    if (score >= 12) return '在感兴趣的话题上表现积极，但对不感兴趣的内容参与度较低'
    if (score >= 8) return '基本能完成学习任务，但很少主动深入探索或提出问题'
    return '学习时容易分心，参与度不高，需要外部激励来维持注意力'
  }

  // 生成综合评价和建议
  const generateComprehensiveAnalysis = (studentResult: QuestionnaireResult, parentResult: QuestionnaireResult) => {
    const studentScores = studentResult.scores
    const parentScores = parentResult.scores
    const studentType = studentResult.motivationType
    const parentType = parentResult.motivationType
    
    // 计算认知差异（使用更合理的阈值）
    const autonomyDiff = Math.abs(studentScores.autonomy - parentScores.autonomy)
    const competenceDiff = Math.abs(studentScores.competence - parentScores.competence)
    const engagementDiff = Math.abs(studentScores.engagement - parentScores.engagement)
    const avgDiff = (autonomyDiff + competenceDiff + engagementDiff) / 3
    
    // 改进的一致性判断逻辑
    let consistencyLevel: string
    let consistencyDescription: string
    
    if (avgDiff <= 2) {
      consistencyLevel = '高度一致'
      consistencyDescription = '家长和学生对学习动机的认知非常接近，表明双方有良好的沟通和理解。'
    } else if (avgDiff <= 4) {
      consistencyLevel = '基本一致'
      consistencyDescription = '家长和学生的认知大体相符，存在一些细微差异，这是正常现象。'
    } else if (avgDiff <= 6) {
      consistencyLevel = '存在差异'
      consistencyDescription = '家长和学生在学习动机认知上存在一定差异，需要加强沟通了解。'
    } else {
      consistencyLevel = '差异较大'
      consistencyDescription = '家长和学生的认知存在明显差异，建议深入沟通，了解彼此的真实想法。'
    }
    
    const typeMatch = studentType.id === parentType.id
    
    let analysis = {
      consistency: consistencyLevel,
      typeMatch,
      insights: [] as string[],
      parentPerspective: [] as string[],
      studentPerspective: [] as string[],
      recommendations: [] as string[]
    }
    
    // 添加一致性描述
    analysis.insights.push(consistencyDescription)
    
    // 动机类型匹配分析
    if (typeMatch) {
      analysis.insights.push(`家长和学生都认为学生属于"${studentType.name}"类型，这种认知一致性有助于制定更有效的学习支持策略。`)
    } else {
      analysis.insights.push(`学生自认为是"${studentType.name}"，而家长认为是"${parentType.name}"。这种差异可能源于观察角度不同，建议通过具体行为观察来达成共识。`)
    }
    
    // 分维度差异分析（只有显著差异才提及）
     const dimensionAnalysis: string[] = []
    
    if (autonomyDiff > 3) {
      if (studentScores.autonomy > parentScores.autonomy) {
        dimensionAnalysis.push('**自主性认知差异**：学生认为自己更具学习自主性，建议家长观察并认可孩子的独立学习能力。')
      } else {
        dimensionAnalysis.push('**自主性认知差异**：家长对孩子自主性的评价高于学生自评，可能需要帮助学生建立更强的自主意识。')
      }
    }
    
    if (competenceDiff > 3) {
      if (studentScores.competence > parentScores.competence) {
        dimensionAnalysis.push('**胜任感认知差异**：学生对自己能力较为自信，家长可以更多地肯定和鼓励孩子的能力表现。')
      } else {
        dimensionAnalysis.push('**胜任感认知差异**：家长对孩子能力评价较高，需要帮助学生建立更强的自信心和能力认知。')
      }
    }
    
    if (engagementDiff > 3) {
      if (studentScores.engagement > parentScores.engagement) {
        dimensionAnalysis.push('**参与度认知差异**：学生感受到的学习投入度较高，家长可以更多关注孩子的学习过程和努力。')
      } else {
        dimensionAnalysis.push('**参与度认知差异**：家长观察到的参与度高于学生自感，可能需要了解学生的真实学习感受。')
      }
    }
    
    // 如果没有显著差异，给出积极反馈
    if (dimensionAnalysis.length === 0) {
      analysis.insights.push('在各个动机维度上，家长和学生的认知都比较接近，这表明双方对学习状态有良好的共同理解。')
    } else {
      analysis.insights.push(...dimensionAnalysis)
    }
    
    // 综合性专业建议
    if (consistencyLevel === '高度一致' || consistencyLevel === '基本一致') {
      analysis.recommendations.push('**保持良好沟通**：继续维持当前的沟通模式，定期交流学习感受和观察。')
      
      if (typeMatch) {
        analysis.recommendations.push('**发挥类型优势**：基于共同认知的"' + studentType.name + '"特质，制定针对性的学习发展计划。')
      }
    } else {
      analysis.recommendations.push('**加强深度沟通**：建议每周安排专门时间，让学生表达真实感受，家长分享观察心得。')
      analysis.recommendations.push('**建立观察记录**：通过具体的学习行为记录，帮助双方建立更准确的认知。')
    }
    
    // 基于学生类型的发展建议
    const typeRecommendations: Record<string, string> = {
      'dreamer': '**理想与现实平衡**：帮助将远大目标分解为可执行的具体步骤，在追求理想的同时注重实际行动。',
      'achiever': '**全面均衡发展**：在保持优秀表现的同时，鼓励探索新领域，避免过度追求完美带来的压力。',
      'explorer': '**深度与广度并重**：在支持多元探索的同时，引导在感兴趣的领域进行深入学习和专业发展。',
      'builder': '**内在动机培养**：逐步减少外部控制，通过兴趣引导和成就感建立，培养自主学习的内在驱动力。',
      'challenger': '**优势强化与补短**：发挥现有优势的同时，有针对性地提升相对薄弱的学习动机维度。',
      'supporter': '**信心建立与兴趣激发**：通过发现和培养兴趣点，逐步建立学习自信心和内在动机。'
    }
    
    if (typeRecommendations[studentType.id]) {
      analysis.recommendations.push(typeRecommendations[studentType.id])
    }
    
    // 通用发展建议
    analysis.recommendations.push('**创造支持性环境**：营造积极的学习氛围，关注学习过程中的努力和进步，而非仅仅关注结果。')
    
    if (avgDiff > 4) {
      analysis.recommendations.push('**寻求专业指导**：如果认知差异持续存在，建议咨询教育心理专家，获得更个性化的指导方案。')
    }
    
    return analysis
  }

  const renderMotivationTypeCard = (resultData: QuestionnaireResult, title: string) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="text-3xl font-bold text-blue-600">{resultData.motivationType.name}</div>
          <div className="relative ml-2 group">
            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center cursor-help text-xs text-gray-600 hover:bg-gray-400 transition-colors">
              ?
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
              <div className="font-semibold mb-1">核心特征：</div>
              <ul className="text-xs space-y-1 mb-2">
                {resultData.motivationType.characteristics.map((char, index) => (
                  <li key={index}>• {char}</li>
                ))}
              </ul>
              <div className="font-semibold mb-1">主要优势：</div>
              <ul className="text-xs space-y-1">
                {resultData.motivationType.strengths.slice(0, 2).map((strength, index) => (
                  <li key={index}>• {strength}</li>
                ))}
              </ul>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{resultData.motivationType.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">优势特征</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {resultData.motivationType.strengths.map((strength, index) => (
                <li key={index}>• {strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">成长空间</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {resultData.motivationType.challenges.map((challenge, index) => (
                <li key={index}>• {challenge}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-4">
      <div id="results-content">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            {viewMode === 'student' && (
              <div className="mb-4">
                <button
                  onClick={handleBackToCombined}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mx-auto"
                >
                  ← 返回综合报告
                </button>
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {viewMode === 'student' ? '学生详细学习动机报告' : 
               combinedResults ? '学习动机综合分析报告' : '您的学习动机画像报告'}
            </h1>
            <p className="text-gray-600">
              基于ACE动机模型的科学分析结果
            </p>
            {combinedResults && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-600">
                  学生：{combinedResults.student.userInfo?.studentName || '学生'} | 
                  家长：{combinedResults.parent.userInfo?.parentName || '家长'}
                </div>
                <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg inline-block">
                  报告ID：{combinedResults.reportId || '未生成'}
                </div>
              </div>
            )}
            {result && !combinedResults && (
              <div className="mt-4">
                <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg inline-block">
                  报告ID：{result.reportId || '未生成'}
                </div>
              </div>
            )}
          </div>
          
          {combinedResults && viewMode !== 'student' ? (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Brain className="inline-block mr-2" size={24} />
                    学生与家长视角对比分析
                  </h3>
                  <button
                    onClick={handleExportReport}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载报告
                  </button>
                </div>
                <div className="h-80">
                  <RadarChart 
                    studentData={combinedResults ? {
                      autonomy: combinedResults.student.scores.autonomy,
                      competence: combinedResults.student.scores.competence,
                      engagement: combinedResults.student.scores.engagement
                    } : undefined}
                    parentData={combinedResults ? {
                      autonomy: combinedResults.parent.scores.autonomy,
                      competence: combinedResults.parent.scores.competence,
                      engagement: combinedResults.parent.scores.engagement
                    } : undefined}
                  />
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {renderMotivationTypeCard(combinedResults.student, '学生的动机类型')}
                {renderMotivationTypeCard(combinedResults.parent, '家长眼中的学生动机类型')}
              </div>
              
              {/* AI生成的专家综合评价与建议 */}
              {/* AI生成的专家综合评价与建议 */}
               <div className="bg-white rounded-2xl shadow-xl p-8">
                 <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                   <Brain className="inline-block mr-2" size={24} />
                   AI专家综合评价与建议
                 </h3>
                 
                 {isGeneratingEvaluation ? (
                   <div className="flex items-center justify-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
                     <span className="text-gray-600">AI专家正在分析中，请稍候...</span>
                   </div>
                 ) : evaluationError ? (
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                     <div className="flex items-center mb-2">
                       <span className="text-red-600 font-medium">生成失败</span>
                     </div>
                     <p className="text-red-700 text-sm mb-3">{evaluationError}</p>
                     <button
                       onClick={() => generateAIExpertEvaluation(combinedResults.student, combinedResults.parent)}
                       className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                     >
                       重新生成
                     </button>
                   </div>
                 ) : aiExpertEvaluation ? (
                   <AIExpertEvaluation 
                     evaluation={aiExpertEvaluation}
                     onRegenerate={() => {
                       setAiExpertEvaluation('')
                       generateAIExpertEvaluation(combinedResults.student, combinedResults.parent)
                     }}
                   />
                 ) : (
                   <div className="text-center py-8">
                     <button
                       onClick={() => generateAIExpertEvaluation(combinedResults.student, combinedResults.parent)}
                       className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                     >
                       生成AI专家评价
                     </button>
                   </div>
                 )}
               </div>
              
              {/* 综合报告操作按钮 */}
              <div className="mt-8 flex justify-center flex-wrap gap-4">
                <button
                  onClick={handleViewStudentReport}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-300"
                >
                  <User className="w-5 h-5 mr-2" />
                  查看学生报告
                </button>
                
                <button
                  onClick={handleStartChat}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  AI深度解读
                </button>
                
                <button
                  onClick={handleRetakeTest}
                  className="flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  重新测评
                </button>
                
                <button
                  onClick={() => alert('分享功能开发中...')}
                  className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  分享结果
                </button>
              </div>
            </div>
          ) : (
             result && (viewMode === 'student' || !combinedResults) && (
              <div className="space-y-8">
                {/* 学生动机类型卡片 */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {renderMotivationTypeCard(result, '您的学习动机类型')}
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Brain className="mr-2 text-blue-600" />
                      ACE理论解读
                    </h3>
                    <div className="text-gray-700 space-y-3">
                      <p className="text-sm leading-relaxed">
                        ACE理论是自我决定理论的核心，包含三个基本心理需求：
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div>
                            <strong className="text-blue-700">自主性(Autonomy)</strong>：感受到自己是学习的主人，能够自主选择和控制学习过程
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div>
                            <strong className="text-green-700">胜任感(Competence)</strong>：相信自己有能力完成学习任务，体验到成功和成长
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div>
                            <strong className="text-purple-700">参与度(Engagement)</strong>：对学习内容感兴趣，愿意投入时间和精力
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACE维度详细分析 */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                    您的学习动机详细分析
                  </h3>
                  
                  <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <div className="h-80">
                      <RadarChart 
                        autonomy={result.scores.autonomy}
                        competence={result.scores.competence}
                        engagement={result.scores.engagement}
                      />
                    </div>
                    <div className="space-y-4">
                      {/* 自主性详细分析 */}
                      <div className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-blue-800">自主性 (Autonomy)</h4>
                          <span className="text-2xl font-bold text-blue-600">{result.scores.autonomy}/20</span>
                        </div>
                        <div className="text-sm text-blue-700 space-y-2">
                          <p><strong>当前状态：</strong>{getAutonomyDescription(result.scores.autonomy)}</p>
                          <p><strong>具体表现：</strong>{getAutonomyBehavior(result.scores.autonomy)}</p>
                        </div>
                      </div>
                      
                      {/* 胜任感详细分析 */}
                      <div className="p-6 bg-green-50 rounded-xl border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-green-800">胜任感 (Competence)</h4>
                          <span className="text-2xl font-bold text-green-600">{result.scores.competence}/20</span>
                        </div>
                        <div className="text-sm text-green-700 space-y-2">
                          <p><strong>当前状态：</strong>{getCompetenceDescription(result.scores.competence)}</p>
                          <p><strong>具体表现：</strong>{getCompetenceBehavior(result.scores.competence)}</p>
                        </div>
                      </div>
                      
                      {/* 参与度详细分析 */}
                      <div className="p-6 bg-purple-50 rounded-xl border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-purple-800">参与度 (Engagement)</h4>
                          <span className="text-2xl font-bold text-purple-600">{result.scores.engagement}/20</span>
                        </div>
                        <div className="text-sm text-purple-700 space-y-2">
                          <p><strong>当前状态：</strong>{getEngagementDescription(result.scores.engagement)}</p>
                          <p><strong>具体表现：</strong>{getEngagementBehavior(result.scores.engagement)}</p>
                        </div>
                      </div>
                    </div>
                   
                  <div className="mt-6 grid grid-cols-3 gap-4">
                      {radarData.map((item) => (
                        <div key={item.dimension} className="text-center">
                          <div className="text-2xl font-bold text-primary-600">
                            {item.score}
                          </div>
                          <div className="text-sm text-gray-600">{item.dimension}</div>
                          <div className="text-xs text-gray-400">满分 {item.fullMark}</div>
                        </div>
                      ))}
                    </div>
                    
                    {result.weakDimensions.length > 0 && (
                      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">需要关注的维度</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.weakDimensions.map((dim) => (
                            <span 
                              key={dim}
                              className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm"
                            >
                              {getDimensionName(dim)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      个性化成长建议
                    </h3>
                    
                    <div className="space-y-6">
                      {result.suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-gray-800">{suggestion.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.priority === 'high' ? '高优先级' :
                               suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{suggestion.content}</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.keywords.map((keyword, keyIndex) => (
                              <span key={keyIndex} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      下一步行动
                    </h3>
                    
                    {isFromStudentQuestionnaire ? (
                      <div className="space-y-4">
                        <button
                          onClick={handleContinueParentQuestionnaire}
                          className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 text-lg font-semibold"
                        >
                          <ArrowRight className="w-6 h-6 mr-2" />
                          继续家长问卷
                        </button>
                        <p className="text-center text-gray-600 text-sm">
                          完成家长问卷后，您将获得更全面的学习动机分析报告
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={handleStartChat}
                          className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          AI深度解读
                        </button>
                        
                        <button
                          onClick={handleExportReport}
                          className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          导出报告
                        </button>
                        
                        <button
                          onClick={handleRetakeTest}
                          className="flex items-center justify-center px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" />
                          重新测评
                        </button>
                        
                        <button
                          onClick={() => alert('分享功能开发中...')}
                          className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                        >
                          <Share2 className="w-5 h-5 mr-2" />
                          分享结果
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResultsContent />
    </Suspense>
  )
}