import { NextRequest } from 'next/server';
import { aiService } from '../../../../../utils/aiService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 验证必需的字段
    if (!data.messages || !Array.isArray(data.messages)) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少消息数据' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 获取流式响应
    const stream = await aiService.chatWithAIStream(
      data.messages,
      data.studentContext
    );

    // 创建转换流来处理SSE格式
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const decoder = new TextDecoder();
        const text = decoder.decode(chunk);
        
        // 解析流式响应数据
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                // 发送SSE格式的数据
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    });

    // 返回SSE响应
    return new Response(
      stream.pipeThrough(transformStream),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    console.error('流式AI聊天失败:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'AI聊天失败，请重试' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}