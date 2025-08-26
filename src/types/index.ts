// ACE动机模型相关类型定义

export interface QuestionnaireResponse {
  user_id: string
  role: 'student' | 'parent'
  responses: Record<string, number> // 问题ID -> 分数
  score: {
    autonomy: number    // 自主性得分
    competence: number  // 胜任感得分
    engagement: number  // 参与度得分
  }
  type: string // 动机类型标签
  timestamp: string
}

export interface Question {
  id: string
  text: string
  dimension: 'autonomy' | 'competence' | 'engagement'
  options: {
    value: number
    label: string
  }[]
}

export interface MotivationType {
  id: string
  name: string
  description: string
  characteristics: string[]
  strengths: string[]
  challenges: string[]
  icon: string
}

export interface Suggestion {
  id: string
  title: string
  content: string
  type: string // 对应的动机类型
  dimension?: 'autonomy' | 'competence' | 'engagement' // 针对的薄弱维度
  visual?: string // 配图路径
  keywords: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface UserProfile {
  id: string
  role: 'student' | 'parent'
  questionnaire: QuestionnaireResponse
  motivationType: MotivationType
  suggestions: Suggestion[]
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  context: {
    userProfile: UserProfile
    currentTopic?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ReportData {
  userProfile: UserProfile
  radarData: {
    dimension: string
    score: number
    maxScore: number
  }[]
  topSuggestions: Suggestion[]
  generatedAt: string
}