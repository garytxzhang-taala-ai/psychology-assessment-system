import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// 模拟AI回复的关键词匹配系统
const keywordResponses = {
  '自主性': [
    '自主性是学习动机的重要组成部分，它反映了你对学习过程的控制感。',
    '提高自主性可以通过设定个人学习目标、选择学习方法和管理学习时间来实现。',
    '当你感到对学习有更多控制权时，学习动机会显著提升。'
  ],
  '胜任感': [
    '胜任感体现了你对自己学习能力的信心程度。',
    '建立胜任感需要从小的成功开始，逐步挑战更难的任务。',
    '记住，每个人都有自己的学习节奏，重要的是持续进步。'
  ],
  '参与度': [
    '参与度反映了你在学习活动中的投入程度和兴趣水平。',
    '提高参与度可以通过寻找学习内容与个人兴趣的连接点来实现。',
    '积极参与讨论、提问和实践活动都能增强学习参与度。'
  ],
  '梦想者': [
    '作为梦想者类型，你有着丰富的想象力和远大的目标。',
    '建议你将大目标分解为具体的小步骤，这样更容易实现。',
    '保持你的创造力，同时培养执行力和坚持性。'
  ],
  '成就者': [
    '成就者类型的你注重结果和成功，这是很好的动力源泉。',
    '建议设定具体、可衡量的学习目标，并庆祝每个里程碑。',
    '记住过程同样重要，享受学习的过程而不仅仅是结果。'
  ],
  '探索者': [
    '探索者类型的你对新知识充满好奇，这是学习的宝贵品质。',
    '建议你保持开放的心态，多尝试不同的学习方法和领域。',
    '将好奇心转化为深度学习，避免浅尝辄止。'
  ],
  '建设者': [
    '建设者类型的你喜欢通过实践来学习，这是很有效的学习方式。',
    '建议多参与项目实践、动手操作和团队合作。',
    '将理论知识与实际应用相结合，会让你的学习更有成效。'
  ],
  '挑战者': [
    '挑战者类型的你喜欢面对困难，这种精神很值得赞赏。',
    '建议合理设定挑战难度，既要有挑战性又要可实现。',
    '学会从失败中学习，每次挫折都是成长的机会。'
  ],
  '支持者': [
    '支持者类型的你重视人际关系和团队合作。',
    '建议多参与小组学习、同伴互助和讨论活动。',
    '你的合作精神是团队的宝贵财富，也要注意发展独立思考能力。'
  ],
  '学习方法': [
    '有效的学习方法因人而异，重要的是找到适合自己的方式。',
    '建议尝试多种学习技巧：番茄工作法、思维导图、费曼学习法等。',
    '定期反思和调整学习方法，持续优化学习效果。'
  ],
  '动机': [
    '学习动机是推动学习行为的内在力量。',
    '内在动机比外在动机更持久，培养对学习本身的兴趣很重要。',
    '当动机不足时，可以回想学习的初心和长远目标。'
  ],
  '目标': [
    '明确的目标是学习成功的关键因素之一。',
    '建议使用SMART原则设定目标：具体、可衡量、可实现、相关性、时限性。',
    '定期回顾和调整目标，确保它们与你的成长保持一致。'
  ]
};

const defaultResponses = [
  '这是一个很好的问题！基于你的测评结果，我建议你关注自己的学习动机类型特点。',
  '每个人的学习方式都是独特的，重要的是找到适合自己的方法。',
  '学习是一个持续的过程，保持耐心和坚持是成功的关键。',
  '你可以尝试将学习内容与自己的兴趣和目标联系起来，这样会更有动力。',
  '记住，小步骤的积累会带来大的改变，每天进步一点点就很棒了！'
];

function generateAIResponse(message: string, userProfile?: any): string {
  // 检查消息中是否包含关键词
  for (const [keyword, responses] of Object.entries(keywordResponses)) {
    if (message.includes(keyword)) {
      const randomIndex = Math.floor(Math.random() * responses.length);
      return responses[randomIndex];
    }
  }
  
  // 如果没有匹配的关键词，返回默认回复
  const randomIndex = Math.floor(Math.random() * defaultResponses.length);
  return defaultResponses[randomIndex];
}

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }
    
    // 模拟AI处理时间
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const aiResponse = generateAIResponse(message, userProfile);
    
    const response: ChatMessage = {
      id: Date.now().toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
    };
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}