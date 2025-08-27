import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../utils/aiService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 验证必需的字段
    if (!data.messages || !Array.isArray(data.messages)) {
      return NextResponse.json(
        { success: false, error: '缺少消息数据' },
        { status: 400 }
      );
    }

    // 调用AI服务进行对话
    const response = await aiService.chatWithAI(
      data.messages,
      data.studentContext
    );

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
      { success: false, error: 'AI聊天失败，请重试' },
      { status: 500 }
    );
  }
}