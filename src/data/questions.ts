import { Question } from '@/types'

// 学生问卷
export const aceQuestions: Question[] = [
  // 自主性 (Autonomy) 维度 - 4题
  {
    id: 'A1',
    text: '我能够自主决定自己的学习方式和节奏',
    dimension: 'autonomy',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'A2',
    text: '我觉得自己的学习目标是由自己设定的，而不是被强加的',
    dimension: 'autonomy',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'A3',
    text: '在学习过程中，我有足够的选择权和控制权',
    dimension: 'autonomy',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'A4',
    text: '我学习是因为我真正想要学习，而不是为了满足他人期望',
    dimension: 'autonomy',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },

  // 胜任感 (Competence) 维度 - 4题
  {
    id: 'C1',
    text: '我相信自己有能力掌握正在学习的内容',
    dimension: 'competence',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'C2',
    text: '当遇到学习困难时，我能够找到有效的解决方法',
    dimension: 'competence',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'C3',
    text: '我经常能够成功完成学习任务，感到有成就感',
    dimension: 'competence',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'C4',
    text: '我觉得自己在学习方面是有天赋和能力的',
    dimension: 'competence',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },

  // 参与度 (Engagement) 维度 - 4题
  {
    id: 'E1',
    text: '我在学习时能够保持专注和投入',
    dimension: 'engagement',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'E2',
    text: '学习内容让我感到有趣和有意义',
    dimension: 'engagement',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'E3',
    text: '我愿意在学习上投入更多的时间和精力',
    dimension: 'engagement',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'E4',
    text: '我经常主动寻找学习机会和挑战',
    dimension: 'engagement',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  }
]

// 家长问卷 - 评估家长对学生ACE动机的认知
export const parentQuestions: Question[] = [
  // 自主性 (Autonomy) 维度 - 家长视角
  {
    id: 'PA1',
    text: '我认为我的孩子能够自主决定自己的学习方式和节奏',
    dimension: 'autonomy',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PA2',
    text: '我觉得我的孩子的学习目标是由他/她自己设定的，而不是被强加的',
    dimension: 'autonomy',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PA3',
    text: '在学习过程中，我认为我的孩子有足够的选择权和控制权',
    dimension: 'autonomy',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PA4',
    text: '我认为我的孩子学习是因为他/她真正想要学习，而不是为了满足他人期望',
    dimension: 'autonomy',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },

  // 胜任感 (Competence) 维度 - 家长视角
  {
    id: 'PC1',
    text: '我相信我的孩子有能力掌握正在学习的内容',
    dimension: 'competence',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PC2',
    text: '当我的孩子遇到学习困难时，我认为他/她能够找到有效的解决方法',
    dimension: 'competence',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PC3',
    text: '我观察到我的孩子经常能够成功完成学习任务，感到有成就感',
    dimension: 'competence',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PC4',
    text: '我觉得我的孩子在学习方面是有天赋和能力的',
    dimension: 'competence',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },

  // 参与度 (Engagement) 维度 - 家长视角
  {
    id: 'PE1',
    text: '我观察到我的孩子在学习时能够保持专注和投入',
    dimension: 'engagement',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PE2',
    text: '我认为学习内容让我的孩子感到有趣和有意义',
    dimension: 'engagement',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PE3',
    text: '我观察到我的孩子愿意在学习上投入更多的时间和精力',
    dimension: 'engagement',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  },
  {
    id: 'PE4',
    text: '我认为我的孩子经常主动寻找学习机会和挑战',
    dimension: 'engagement',
    options: [
      { value: 1, label: '完全不符合' },
      { value: 2, label: '不太符合' },
      { value: 3, label: '一般' },
      { value: 4, label: '比较符合' },
      { value: 5, label: '完全符合' }
    ]
  }
]

// 计算ACE各维度得分
export function calculateACEScores(responses: Record<string, number>) {
  // 检测是学生问卷还是家长问卷
  const isParentQuestionnaire = Object.keys(responses).some(key => key.startsWith('P'))
  
  let autonomyQuestions: string[]
  let competenceQuestions: string[]
  let engagementQuestions: string[]
  
  if (isParentQuestionnaire) {
    // 家长问卷问题ID
    autonomyQuestions = ['PA1', 'PA2', 'PA3', 'PA4']
    competenceQuestions = ['PC1', 'PC2', 'PC3', 'PC4']
    engagementQuestions = ['PE1', 'PE2', 'PE3', 'PE4']
  } else {
    // 学生问卷问题ID
    autonomyQuestions = ['A1', 'A2', 'A3', 'A4']
    competenceQuestions = ['C1', 'C2', 'C3', 'C4']
    engagementQuestions = ['E1', 'E2', 'E3', 'E4']
  }

  const autonomy = autonomyQuestions.reduce((sum, qId) => sum + (responses[qId] || 0), 0)
  const competence = competenceQuestions.reduce((sum, qId) => sum + (responses[qId] || 0), 0)
  const engagement = engagementQuestions.reduce((sum, qId) => sum + (responses[qId] || 0), 0)

  return {
    autonomy,
    competence,
    engagement
  }
}