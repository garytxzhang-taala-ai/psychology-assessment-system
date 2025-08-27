import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../utils/aiService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, studentContext } = await request.json();
    
    // 验证必需的字段
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: '消息格式不正确' },
        { status: 400 }
      );
    }

    // 调用AI服务进行聊天
    const response = await aiService.chatWithAI(messages, studentContext);

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI聊天失败:', error);
    return NextResponse.json(
      { success: false, error: 'AI服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}