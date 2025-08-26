// AI服务模块 - 集成大模型API

interface StudentACEData {
  autonomy: number;
  competence: number;
  engagement: number;
}

interface ExpertEvaluationInput {
  student_name: string;
  student_ace: StudentACEData;
  parent_ace: StudentACEData;
  observation?: string;
  student_motivation_type?: string;
  parent_motivation_type?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class AIService {
  private apiKey = 'sk-29c306bada2f48b8bb34ef53d97081aa';
  private baseUrl = 'https://api.deepseek.com/v1/chat/completions';

  // 专家评价生成的系统提示词
  private expertEvaluationPrompt = `你是Jin Qi，一位资深的教育心理学专家，专门研究学生学习动机和认知发展。请基于以下数据为学生提供专业的心理评估和建议。

请严格按照以下结构提供专业的心理评估报告：

1. **动机类型分析** (Motivation Type Analysis)
   - 确定学生的主要动机类型（如梦想家、执行者等）
   - 详细说明判断依据和特征分析

2. **学生与家长认知差异分析** (Key Perception Differences)
   - 分析学生自评与家长观察在ACE三个维度上的差异
   - 解释这些差异可能的原因和影响

3. **基于差异程度的ACE提升建议** (Specific ACE Enhancement Recommendations)
   - 自主性(Autonomy)提升的具体策略
   - 胜任感(Competence)增强的实用方法
   - 参与度(Engagement)改善的行动建议

4. **亲子沟通策略建议** (Parent-Child Communication Strategies)
   - 针对发现的认知差异，提供具体的沟通技巧
   - 建议家长如何更好地理解和支持孩子

5. **行动任务规划** (Action Tasks)
   - 一个短期行动任务（1-2周内可完成）
   - 一个长期反思任务（1-3个月的持续关注点）

请用专业但易懂的语言，确保每个部分都有具体可操作的建议，并充分利用提供的问卷数据进行个性化分析。`;

  // AI解读聊天机器人的系统提示词
  private chatbotPrompt = `You are Jin Qi, a warm, insightful educational psychology expert specializing in student motivation and learning psychology. You help students and families understand learning motivation using the ACE Model (Autonomy, Competence, Engagement).

**PART 2: Power the Chatbot ("AI解读")**

You are a motivational Chatbot that guides students in real-time conversation. Your task is to:
• Explore the student's interests and how they relate to learning
• Suggest a doable next-step task that is slightly challenging and meaningful
• Help the student reflect on long-term goals and personal identity

Use open-ended questions, emotional warmth, and actionable guidance. Here are examples of how to guide each:

INTEREST
• "What's something you've been curious about lately?"
• "Have you ever enjoyed a school project more than usual?"

NEXT STEP
• "What's one small thing you could try this week?"
• "Is there a fun idea that's also a little challenging?"

LONG-TERM GOAL
• "What kind of person do you want to become?"
• "How do you want your learning to matter 5 years from now?"

Continue the conversation naturally. Always prioritize listening, empathy, and meaningful reflection. Avoid overwhelming the student with too many options.

请用中文回复，语气要温暖、鼓励，适合与学生对话。`;

  /**
   * 生成备用专家评价（当API不可用时使用）
   */
  private generateFallbackEvaluation(data: ExpertEvaluationInput): string {
    const studentScores = data.student_ace;
    const parentScores = data.parent_ace;
    
    // 计算差异
    const autonomyDiff = Math.abs(studentScores.autonomy - parentScores.autonomy);
    const competenceDiff = Math.abs(studentScores.competence - parentScores.competence);
    const engagementDiff = Math.abs(studentScores.engagement - parentScores.engagement);
    
    // 确定主要动机类型
    const highestScore = Math.max(studentScores.autonomy, studentScores.competence, studentScores.engagement);
    let motivationType = '平衡型';
    if (studentScores.autonomy === highestScore) motivationType = '自主驱动型';
    else if (studentScores.competence === highestScore) motivationType = '成就导向型';
    else if (studentScores.engagement === highestScore) motivationType = '参与热情型';
    
    return `## Jin Qi专家评价与建议

### 1. 动机类型分析 (Motivation Type Analysis)

基于${data.student_name}的ACE评估数据分析，学生主要表现为**${motivationType}**特征。

**判断依据：**
- 自主性得分：${studentScores.autonomy}/20分
- 胜任感得分：${studentScores.competence}/20分
- 参与度得分：${studentScores.engagement}/20分

学生在${highestScore === studentScores.autonomy ? '自主性' : highestScore === studentScores.competence ? '胜任感' : '参与度'}方面表现最为突出，这表明其学习动机主要由${highestScore === studentScores.autonomy ? '内在驱动和自我决定' : highestScore === studentScores.competence ? '成就感和能力证明' : '兴趣和投入感'}所推动。

### 2. 学生与家长认知差异分析 (Key Perception Differences)

**认知差异程度：**
- 自主性认知差异：${autonomyDiff}分 ${autonomyDiff > 5 ? '(差异较大)' : '(差异适中)'}
- 胜任感认知差异：${competenceDiff}分 ${competenceDiff > 5 ? '(差异较大)' : '(差异适中)'}
- 参与度认知差异：${engagementDiff}分 ${engagementDiff > 5 ? '(差异较大)' : '(差异适中)'}

**差异分析：**
${autonomyDiff > 5 ? '• 自主性方面存在显著认知差异，可能反映家长与学生对独立学习能力的理解不同\n' : ''}
${competenceDiff > 5 ? '• 胜任感方面存在显著认知差异，建议关注学生的自信心状态\n' : ''}
${engagementDiff > 5 ? '• 参与度方面存在显著认知差异，需要观察学生的实际学习投入情况\n' : ''}

### 3. 基于差异程度的ACE提升建议 (Specific ACE Enhancement Recommendations)

**自主性(Autonomy)提升策略：**
- 逐步增加学生在学习计划制定中的参与度
- 提供多种学习方法选择，让学生自主决定
- 建立学习反思机制，培养自我评估能力

**胜任感(Competence)增强方法：**
- 设置阶梯式学习目标，确保适当挑战性
- 建立及时反馈机制，认可学生的进步
- 创造展示学习成果的机会

**参与度(Engagement)改善建议：**
- 结合学生兴趣设计学习活动
- 采用多样化的学习方式增加趣味性
- 建立学习伙伴关系，增强社交学习体验

### 4. 亲子沟通策略建议 (Parent-Child Communication Strategies)

**针对认知差异的沟通技巧：**
- 定期进行"学习状态对话"，了解彼此的观察和感受
- 使用"我观察到..."的表达方式，避免评判性语言
- 建立共同的学习目标讨论时间

**支持策略：**
- 家长多倾听学生的学习体验和困难
- 共同制定学习支持计划，而非单方面要求
- 关注过程努力，而非仅仅关注结果

### 5. 行动任务规划 (Action Tasks)

**短期行动任务（1-2周内）：**
进行一次深度的"学习动机对话"，学生和家长分别分享对当前学习状态的看法，找出认知差异的具体原因，并制定一个小的改进计划。

**长期反思任务（1-3个月）：**
建立"学习动机观察日记"，家长和学生每周记录一次对学习状态的观察，每月进行一次对比讨论，持续调整支持策略，关注ACE三个维度的平衡发展。

---

*本评价基于当前数据分析生成，建议结合实际情况灵活调整。如需更深入的个性化指导，欢迎继续与Jin Qi专家进行深度对话。*`;
  }

  /**
   * 生成专家评价与建议
   */
  async generateExpertEvaluation(data: ExpertEvaluationInput): Promise<string> {
    try {
      const inputData = {
        student_name: data.student_name,
        student_ace: data.student_ace,
        parent_ace: data.parent_ace,
        observation: data.observation || '',
        student_motivation_type: data.student_motivation_type || '',
        parent_motivation_type: data.parent_motivation_type || ''
      };

      const userMessage = `请基于以下详细数据生成专家评价与建议：\n\n**学生基本信息：**\n姓名：${data.student_name}\n\n**ACE动机评估数据：**\n学生自评：\n- 自主性：${data.student_ace.autonomy}/20分\n- 胜任感：${data.student_ace.competence}/20分\n- 参与度：${data.student_ace.engagement}/20分\n\n家长观察：\n- 自主性：${data.parent_ace.autonomy}/20分\n- 胜任感：${data.parent_ace.competence}/20分\n- 参与度：${data.parent_ace.engagement}/20分\n\n**动机类型信息：**\n学生动机类型：${data.student_motivation_type || '待分析'}\n家长认知类型：${data.parent_motivation_type || '待分析'}\n\n**行为观察记录：**\n${data.observation || '无特殊观察记录'}\n\n请严格按照系统提示中的5个部分结构（动机类型分析、认知差异分析、ACE提升建议、亲子沟通策略、行动任务规划），为${data.student_name}生成完整的专家评价报告。`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        signal: AbortSignal.timeout(30000), // 30秒超时
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: this.expertEvaluationPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const result = await response.json();
      return result.choices[0]?.message?.content || '生成专家评价失败，请重试。';
    } catch (error) {
      console.error('生成专家评价失败，使用备用评价:', error);
      // 当API不可用时，返回基于数据的备用评价
      return this.generateFallbackEvaluation(data);
    }
  }

  /**
   * AI聊天机器人对话
   */
  async chatWithAI(messages: ChatMessage[], studentContext?: any): Promise<string> {
    try {
      // 构建上下文信息
      let contextMessage = '';
      if (studentContext) {
        contextMessage = `\n\n学生背景信息：\n- 姓名：${studentContext.name || ''}\n- ACE得分：自主性${studentContext.autonomy || 0}分，胜任感${studentContext.competence || 0}分，参与度${studentContext.engagement || 0}分\n- 动机类型：${studentContext.motivationType || ''}\n\n请基于这些信息进行个性化指导。`;
      }

      const systemMessage = this.chatbotPrompt + contextMessage;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        signal: AbortSignal.timeout(30000), // 30秒超时
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            ...messages
          ],
          max_tokens: 800,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const result = await response.json();
      return result.choices[0]?.message?.content || '抱歉，我现在无法回复，请稍后重试。';
    } catch (error) {
      console.error('AI聊天失败:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          return '网络连接超时，请检查网络连接后重试。';
        }
        if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
          return 'AI服务暂时不可用，请稍后重试。';
        }
      }
      return '抱歉，我现在遇到了一些技术问题，请稍后重试。如果问题持续，请联系技术支持。';
    }
  }

  /**
   * 检查API连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        signal: AbortSignal.timeout(15000), // 15秒超时
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });
      return response.ok;
    } catch (error) {
      console.error('API连接检查失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const aiService = new AIService();
export type { ExpertEvaluationInput, ChatMessage };