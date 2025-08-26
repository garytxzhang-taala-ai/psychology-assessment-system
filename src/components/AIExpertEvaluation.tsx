'use client'

import { Brain, Target, Users, MessageSquare, CheckCircle, Clock } from 'lucide-react'

interface AIExpertEvaluationProps {
  evaluation: string
  onRegenerate: () => void
}

interface ParsedEvaluation {
  motivationAnalysis: string
  perceptionDifferences: string
  aceRecommendations: string
  communicationStrategies: string
  actionTasks: string
}

function parseEvaluation(evaluation: string): ParsedEvaluation {
  // 移除所有Markdown符号
  const cleanText = evaluation
    .replace(/#{1,6}\s*/g, '') // 移除标题符号
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // 移除粗体和斜体
    .replace(/`([^`]+)`/g, '$1') // 移除代码符号
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接格式
    .replace(/^\s*[-*+]\s+/gm, '• ') // 将列表符号统一为圆点
    .replace(/^\s*\d+\.\s+/gm, '') // 移除数字列表符号
    .trim()

  // 按照5个部分进行分割
  const sections = {
    motivationAnalysis: '',
    perceptionDifferences: '',
    aceRecommendations: '',
    communicationStrategies: '',
    actionTasks: ''
  }

  // 使用正则表达式匹配各个部分
  const motivationMatch = cleanText.match(/(?:1\.|动机类型分析|Motivation Type Analysis)[\s\S]*?(?=(?:2\.|学生与家长认知差异分析|Key Perception Differences)|$)/i)
  const perceptionMatch = cleanText.match(/(?:2\.|学生与家长认知差异分析|Key Perception Differences)[\s\S]*?(?=(?:3\.|基于差异程度的ACE提升建议|Specific ACE Enhancement)|$)/i)
  const aceMatch = cleanText.match(/(?:3\.|基于差异程度的ACE提升建议|Specific ACE Enhancement)[\s\S]*?(?=(?:4\.|亲子沟通策略建议|Parent-Child Communication)|$)/i)
  const communicationMatch = cleanText.match(/(?:4\.|亲子沟通策略建议|Parent-Child Communication)[\s\S]*?(?=(?:5\.|行动任务规划|Action Tasks)|$)/i)
  const actionMatch = cleanText.match(/(?:5\.|行动任务规划|Action Tasks)[\s\S]*$/i)

  if (motivationMatch) {
    sections.motivationAnalysis = motivationMatch[0].replace(/^(?:1\.|动机类型分析|Motivation Type Analysis)\s*/i, '').trim()
  }
  if (perceptionMatch) {
    sections.perceptionDifferences = perceptionMatch[0].replace(/^(?:2\.|学生与家长认知差异分析|Key Perception Differences)\s*/i, '').trim()
  }
  if (aceMatch) {
    sections.aceRecommendations = aceMatch[0].replace(/^(?:3\.|基于差异程度的ACE提升建议|Specific ACE Enhancement)[\s\S]*?(?=自主性|Autonomy)/i, '').trim()
  }
  if (communicationMatch) {
    sections.communicationStrategies = communicationMatch[0].replace(/^(?:4\.|亲子沟通策略建议|Parent-Child Communication)[\s\S]*?(?=针对|支持)/i, '').trim()
  }
  if (actionMatch) {
    sections.actionTasks = actionMatch[0].replace(/^(?:5\.|行动任务规划|Action Tasks)\s*/i, '').trim()
  }

  // 如果解析失败，将整个内容放在第一个部分
  if (!motivationMatch && !perceptionMatch && !aceMatch && !communicationMatch && !actionMatch) {
    sections.motivationAnalysis = cleanText
  }

  return sections
}

export default function AIExpertEvaluation({ evaluation, onRegenerate }: AIExpertEvaluationProps) {
  const parsed = parseEvaluation(evaluation)

  const formatContent = (content: string) => {
    if (!content) return null
    
    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return <br key={index} />
      
      // 检查是否是列表项
      if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
        return (
          <div key={index} className="flex items-start mb-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span className="text-gray-700">{trimmedLine.replace(/^[•-]\s*/, '')}</span>
          </div>
        )
      }
      
      // 检查是否是小标题（包含冒号或括号）
      if (trimmedLine.includes('：') || trimmedLine.includes(':') || /^[^\s]+\([^)]+\)/.test(trimmedLine)) {
        return (
          <h4 key={index} className="font-semibold text-gray-800 mt-4 mb-2 first:mt-0">
            {trimmedLine}
          </h4>
        )
      }
      
      return (
        <p key={index} className="text-gray-700 mb-2 leading-relaxed">
          {trimmedLine}
        </p>
      )
    })
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
      <div className="flex items-center mb-6">
        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
        <span className="text-lg font-semibold text-gray-800">由AI教育心理专家Jin Qi提供</span>
      </div>

      <div className="space-y-8">
        {/* 1. 动机类型分析 */}
        {parsed.motivationAnalysis && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">动机类型分析</h3>
            </div>
            <div className="pl-11">
              {formatContent(parsed.motivationAnalysis)}
            </div>
          </div>
        )}

        {/* 2. 学生与家长认知差异分析 */}
        {parsed.perceptionDifferences && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">认知差异分析</h3>
            </div>
            <div className="pl-11">
              {formatContent(parsed.perceptionDifferences)}
            </div>
          </div>
        )}

        {/* 3. ACE提升建议 */}
        {parsed.aceRecommendations && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">ACE提升建议</h3>
            </div>
            <div className="pl-11">
              {formatContent(parsed.aceRecommendations)}
            </div>
          </div>
        )}

        {/* 4. 亲子沟通策略 */}
        {parsed.communicationStrategies && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">沟通策略建议</h3>
            </div>
            <div className="pl-11">
              {formatContent(parsed.communicationStrategies)}
            </div>
          </div>
        )}

        {/* 5. 行动任务规划 */}
        {parsed.actionTasks && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">行动任务规划</h3>
            </div>
            <div className="pl-11">
              <div className="grid md:grid-cols-2 gap-6">
                {parsed.actionTasks.includes('短期') && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-semibold text-blue-800">短期行动任务</span>
                    </div>
                    <div className="text-sm">
                      {formatContent(parsed.actionTasks.split('长期')[0].replace(/短期[^：]*：?/i, '').trim())}
                    </div>
                  </div>
                )}
                {parsed.actionTasks.includes('长期') && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Target className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">长期反思任务</span>
                    </div>
                    <div className="text-sm">
                      {formatContent(parsed.actionTasks.split('长期')[1]?.replace(/[^：]*：?/i, '').trim() || '')}
                    </div>
                  </div>
                )}
                {!parsed.actionTasks.includes('短期') && !parsed.actionTasks.includes('长期') && (
                  <div className="md:col-span-2">
                    {formatContent(parsed.actionTasks)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 重新生成按钮 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            本评价基于ACE动机理论和学生家长问卷数据生成
          </div>
          <button
            onClick={onRegenerate}
            className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            🔄 重新生成评价
          </button>
        </div>
      </div>
    </div>
  )
}
