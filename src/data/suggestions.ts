import { Suggestion } from '../types'

export const suggestionLibrary: Suggestion[] = [
  // 梦想者类型建议
  {
    id: 'dreamer_general_1',
    title: '将梦想转化为行动计划',
    content: '你有很棒的目标和理想！现在需要将这些大目标分解为具体的、可执行的小步骤。建议使用SMART原则（具体、可衡量、可达成、相关性、时限性）来制定学习计划。',
    type: 'dreamer',
    keywords: ['目标分解', '计划制定', 'SMART原则'],
    priority: 'high'
  },
  {
    id: 'dreamer_competence_1',
    title: '提升执行力和成就感',
    content: '建议从小任务开始，每天完成1-2个具体的学习目标，记录完成情况。通过积累小成功来建立信心，逐步提升胜任感。可以使用番茄工作法来提高专注度。',
    type: 'dreamer',
    dimension: 'competence',
    keywords: ['执行力', '成就感', '番茄工作法'],
    priority: 'high'
  },

  // 成就者类型建议
  {
    id: 'achiever_general_1',
    title: '保持优势，寻找新突破',
    content: '你在各方面表现都很不错！建议在保持现有优势的基础上，尝试挑战更高难度的任务，或者探索新的学习领域，避免陷入舒适区。',
    type: 'achiever',
    keywords: ['挑战', '突破', '舒适区'],
    priority: 'medium'
  },
  {
    id: 'achiever_depth_1',
    title: '深度学习与专业发展',
    content: '考虑在某个特别感兴趣的领域进行深度学习，培养专业特长。可以参加相关竞赛、项目或实习，将理论知识转化为实践能力。',
    type: 'achiever',
    keywords: ['深度学习', '专业发展', '实践'],
    priority: 'medium'
  },

  // 探索者类型建议
  {
    id: 'explorer_general_1',
    title: '培养专注力和持续性',
    content: '你的好奇心和学习热情很棒！现在需要培养更好的专注力。建议选择1-2个最感兴趣的领域进行深入学习，避免过度分散注意力。',
    type: 'explorer',
    keywords: ['专注力', '持续性', '深入学习'],
    priority: 'high'
  },
  {
    id: 'explorer_autonomy_1',
    title: '建立学习节奏和计划',
    content: '建议制定每周和每月的学习计划，设定明确的学习目标。可以使用时间管理工具，如日历提醒、学习打卡等，帮助建立稳定的学习节奏。',
    type: 'explorer',
    dimension: 'autonomy',
    keywords: ['时间管理', '学习计划', '学习节奏'],
    priority: 'high'
  },

  // 建设者类型建议
  {
    id: 'builder_general_1',
    title: '激发内在学习动机',
    content: '你的执行力很强！现在需要找到真正让你感兴趣的学习内容。尝试探索不同领域，找到与你的兴趣和价值观相符的学习方向。',
    type: 'builder',
    keywords: ['内在动机', '兴趣探索', '价值观'],
    priority: 'high'
  },
  {
    id: 'builder_autonomy_1',
    title: '培养自主学习能力',
    content: '建议逐步减少对外部指导的依赖，尝试自己制定学习计划和目标。可以从小的决策开始，比如选择学习方法、安排学习时间等。',
    type: 'builder',
    dimension: 'autonomy',
    keywords: ['自主学习', '独立思考', '决策能力'],
    priority: 'high'
  },

  // 挑战者类型建议
  {
    id: 'challenger_general_1',
    title: '均衡发展，拓展视野',
    content: '你在某些领域表现突出！建议在保持优势的同时，也要关注其他领域的发展，培养更全面的能力和素养。',
    type: 'challenger',
    keywords: ['均衡发展', '全面发展', '视野拓展'],
    priority: 'medium'
  },
  {
    id: 'challenger_engagement_1',
    title: '提升学习兴趣和参与度',
    content: '尝试将学习与实际应用结合，参加项目实践、小组讨论等活动。寻找学习内容与现实生活的连接点，提升学习的意义感。',
    type: 'challenger',
    dimension: 'engagement',
    keywords: ['实际应用', '项目实践', '意义感'],
    priority: 'medium'
  },

  // 支持者类型建议
  {
    id: 'supporter_general_1',
    title: '建立学习信心和兴趣',
    content: '每个人都有自己的学习节奏和方式！建议从你感兴趣的小话题开始，设定容易达成的小目标，通过成功体验来建立学习信心。',
    type: 'supporter',
    keywords: ['学习信心', '兴趣培养', '小目标'],
    priority: 'high'
  },
  {
    id: 'supporter_autonomy_1',
    title: '培养学习主动性',
    content: '尝试每天为自己设定一个小的学习任务，可以是阅读一篇文章、学习一个新概念等。重要的是培养主动学习的习惯，而不是被动接受。',
    type: 'supporter',
    dimension: 'autonomy',
    keywords: ['主动性', '学习习惯', '自我驱动'],
    priority: 'high'
  },
  {
    id: 'supporter_competence_1',
    title: '寻找学习支持和帮助',
    content: '不要害怕寻求帮助！可以找老师、同学或家长讨论学习中的困难。加入学习小组，与他人一起学习可以提升动力和效果。',
    type: 'supporter',
    dimension: 'competence',
    keywords: ['学习支持', '寻求帮助', '学习小组'],
    priority: 'high'
  },
  {
    id: 'supporter_engagement_1',
    title: '发现学习的乐趣',
    content: '尝试用不同的方式学习，如游戏化学习、视频教程、实践操作等。找到适合自己的学习方式，让学习变得更有趣和有意义。',
    type: 'supporter',
    dimension: 'engagement',
    keywords: ['学习乐趣', '多样化学习', '游戏化'],
    priority: 'high'
  }
]

// 根据用户画像获取个性化建议
export function getPersonalizedSuggestions(
  motivationType: string,
  weakDimensions: string[]
): Suggestion[] {
  const suggestions: Suggestion[] = []
  
  // 获取该类型的通用建议
  const generalSuggestions = suggestionLibrary.filter(
    s => s.type === motivationType && !s.dimension
  )
  suggestions.push(...generalSuggestions)
  
  // 获取针对薄弱维度的建议
  for (const dimension of weakDimensions) {
    const dimensionSuggestions = suggestionLibrary.filter(
      s => s.type === motivationType && s.dimension === dimension
    )
    suggestions.push(...dimensionSuggestions)
  }
  
  // 按优先级排序
  suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
  
  // 返回前3个建议
  return suggestions.slice(0, 3)
}