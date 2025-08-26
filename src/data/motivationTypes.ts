import { MotivationType } from '../types'

export const motivationTypes: MotivationType[] = [
  {
    id: 'dreamer',
    name: '梦想者',
    description: '有强烈的内在动机和远大目标，但在执行力上可能需要提升',
    characteristics: [
      '有清晰的长远目标和理想',
      '内在动机强烈，学习目的明确',
      '富有创造力和想象力',
      '对感兴趣的领域投入度很高'
    ],
    strengths: [
      '目标导向性强',
      '自我驱动力强',
      '学习热情高',
      '有远见和规划能力'
    ],
    challenges: [
      '可能缺乏具体的执行计划',
      '容易被挫折打击信心',
      '需要提升实际操作能力',
      '可能过于理想化'
    ],
    icon: '🌟'
  },
  {
    id: 'achiever',
    name: '成就者',
    description: '在各方面表现均衡，有较强的执行力和成就感',
    characteristics: [
      '学习能力强，适应性好',
      '能够平衡理想与现实',
      '有良好的自我管理能力',
      '在多个领域都有不错表现'
    ],
    strengths: [
      '综合能力强',
      '执行力强',
      '自信心足',
      '能够持续进步'
    ],
    challenges: [
      '可能缺乏突出的特长',
      '需要找到真正的兴趣点',
      '避免过度追求完美',
      '保持学习的新鲜感'
    ],
    icon: '🏆'
  },
  {
    id: 'explorer',
    name: '探索者',
    description: '对学习充满好奇和热情，但可能缺乏持续的专注力',
    characteristics: [
      '好奇心强，喜欢尝试新事物',
      '学习兴趣广泛',
      '思维活跃，创新能力强',
      '适应变化能力强'
    ],
    strengths: [
      '学习热情高',
      '思维开放',
      '创新能力强',
      '适应性好'
    ],
    challenges: [
      '可能缺乏深度专注',
      '需要提升持续性',
      '容易分散注意力',
      '需要更好的时间管理'
    ],
    icon: '🔍'
  },
  {
    id: 'builder',
    name: '建设者',
    description: '有较强的执行能力，但可能缺乏内在动机或创新思维',
    characteristics: [
      '执行力强，能够完成任务',
      '有一定的学习能力',
      '比较务实和踏实',
      '能够按计划行事'
    ],
    strengths: [
      '执行力强',
      '责任心强',
      '踏实可靠',
      '有一定的坚持性'
    ],
    challenges: [
      '可能缺乏内在动机',
      '需要提升创新思维',
      '可能过于依赖外部指导',
      '需要培养自主学习能力'
    ],
    icon: '🔨'
  },
  {
    id: 'challenger',
    name: '挑战者',
    description: '在某些方面表现突出，但整体发展可能不够均衡',
    characteristics: [
      '在特定领域有突出表现',
      '喜欢接受挑战',
      '有一定的竞争意识',
      '能够在压力下表现'
    ],
    strengths: [
      '在优势领域表现突出',
      '抗压能力强',
      '有竞争优势',
      '目标明确'
    ],
    challenges: [
      '可能发展不够均衡',
      '需要拓展其他领域',
      '可能过于专注单一方向',
      '需要提升综合素养'
    ],
    icon: '⚡'
  },
  {
    id: 'supporter',
    name: '支持者',
    description: '学习动机相对较低，需要更多的外部支持和引导',
    characteristics: [
      '学习主动性相对较低',
      '可能缺乏明确目标',
      '需要更多鼓励和支持',
      '有一定的学习潜力'
    ],
    strengths: [
      '有学习潜力',
      '能够接受指导',
      '有改进空间',
      '可塑性强'
    ],
    challenges: [
      '缺乏内在动机',
      '需要建立自信心',
      '需要找到学习兴趣点',
      '需要更多支持和鼓励'
    ],
    icon: '🤝'
  }
]

// 根据ACE得分识别动机类型
export function identifyMotivationType(scores: {
  autonomy: number
  competence: number
  engagement: number
}): MotivationType {
  const { autonomy, competence, engagement } = scores
  const total = autonomy + competence + engagement
  const maxScore = 20 // 每个维度最高5*4=20分
  
  // 计算各维度的相对强度
  const autonomyStrength = autonomy / maxScore
  const competenceStrength = competence / maxScore
  const engagementStrength = engagement / maxScore
  const totalStrength = total / (maxScore * 3)

  // 识别规则
  if (totalStrength >= 0.8) {
    // 高分段：成就者
    return motivationTypes.find(t => t.id === 'achiever')!
  } else if (autonomyStrength >= 0.7 && engagementStrength >= 0.7) {
    // 高自主性 + 高参与度：梦想者
    return motivationTypes.find(t => t.id === 'dreamer')!
  } else if (engagementStrength >= 0.7 && competenceStrength < 0.6) {
    // 高参与度但胜任感不足：探索者
    return motivationTypes.find(t => t.id === 'explorer')!
  } else if (competenceStrength >= 0.7 && autonomyStrength < 0.6) {
    // 高胜任感但自主性不足：建设者
    return motivationTypes.find(t => t.id === 'builder')!
  } else if (totalStrength >= 0.6) {
    // 中等偏上，某个维度突出：挑战者
    return motivationTypes.find(t => t.id === 'challenger')!
  } else {
    // 整体较低：支持者
    return motivationTypes.find(t => t.id === 'supporter')!
  }
}

// 获取薄弱维度
export function getWeakDimensions(scores: {
  autonomy: number
  competence: number
  engagement: number
}): string[] {
  const { autonomy, competence, engagement } = scores
  const maxScore = 20
  const threshold = 0.6 // 60%以下认为是薄弱维度
  
  const weakDimensions: string[] = []
  
  if (autonomy / maxScore < threshold) {
    weakDimensions.push('autonomy')
  }
  if (competence / maxScore < threshold) {
    weakDimensions.push('competence')
  }
  if (engagement / maxScore < threshold) {
    weakDimensions.push('engagement')
  }
  
  return weakDimensions
}