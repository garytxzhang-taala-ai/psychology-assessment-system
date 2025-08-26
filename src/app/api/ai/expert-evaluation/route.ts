import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../utils/aiService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 验证必需的字段
    if (!data.student_name || !data.student_ace || !data.parent_ace) {
      return NextResponse.json(
        { success: false, error: '缺少必需的数据字段' },
        { status: 400 }
      );
    }

    // 调用AI服务生成专家评价
    const evaluation = await aiService.generateExpertEvaluation({
      student_name: data.student_name,
      student_ace: data.student_ace,
      parent_ace: data.parent_ace,
      observation: data.observation,
      student_motivation_type: data.student_motivation_type,
      parent_motivation_type: data.parent_motivation_type
    });

    return NextResponse.json({
      success: true,
      data: {
        evaluation,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('生成专家评价失败:', error);
    return NextResponse.json(
      { success: false, error: '生成专家评价失败，请重试' },
      { status: 500 }
    );
  }
}