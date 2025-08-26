// 数据库服务工具

interface UserData {
  id: string;
  name?: string;
  email?: string;
  studentName?: string;
  studentAge?: string;
  studentGender?: string;
  school?: string;
  grade?: string;
  parentRole?: string;
  parentName?: string;
  parentAge?: string;
  parentOccupation?: string;
  studentCompleted?: boolean;
  parentCompleted?: boolean;
  studentResults?: any;
  parentResults?: any;
  combinedResults?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface TestResult {
  userId: string;
  role: 'student' | 'parent';
  responses: Record<string, number>;
  scores: {
    autonomy: number;
    competence: number;
    engagement: number;
  };
  motivationType: any;
  weakDimensions: string[];
  suggestions: any[];
  timestamp: string;
  userInfo?: any;
}

class DatabaseService {
  private baseUrl = '/api/users';

  // 保存用户基本信息
  async saveUser(userData: UserData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('保存用户信息失败:', error);
      return { success: false, error: '网络错误，保存失败' };
    }
  }

  // 保存测评结果
  async saveTestResults(userId: string, role: 'student' | 'parent', testResults: TestResult): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role,
          testResults,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('保存测评结果失败:', error);
      return { success: false, error: '网络错误，保存失败' };
    }
  }

  // 获取所有用户数据
  async getAllUsers(): Promise<{ success: boolean; data?: UserData[]; error?: string }> {
    try {
      const response = await fetch(this.baseUrl);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取用户数据失败:', error);
      return { success: false, error: '网络错误，获取数据失败' };
    }
  }

  // 获取单个用户数据
  async getUser(userId: string): Promise<{ success: boolean; data?: UserData; error?: string }> {
    try {
      const response = await this.getAllUsers();
      if (response.success && response.data) {
        const user = response.data.find(u => u.id === userId);
        if (user) {
          return { success: true, data: user };
        } else {
          return { success: false, error: '用户不存在' };
        }
      }
      return { success: false, error: response.error || '获取数据失败' };
    } catch (error) {
      console.error('获取用户数据失败:', error);
      return { success: false, error: '网络错误，获取数据失败' };
    }
  }

  // 更新用户测评结果
  async updateUserResults(userId: string, updates: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, updates }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('更新用户结果失败:', error);
      return { success: false, error: '网络错误，更新失败' };
    }
  }

  // 同步localStorage数据到数据库
  async syncLocalStorageToDatabase(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // 获取当前用户信息
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        return { success: false, error: '未找到当前用户信息' };
      }

      const currentUser = JSON.parse(currentUserStr);
      
      // 保存用户基本信息
      const userSaveResult = await this.saveUser(currentUser);
      if (!userSaveResult.success) {
        return userSaveResult;
      }

      // 保存学生测评结果（如果存在）
      const studentResultsStr = localStorage.getItem(`testResults_student_${currentUser.id}`);
      if (studentResultsStr) {
        const studentResults = JSON.parse(studentResultsStr);
        const studentSaveResult = await this.saveTestResults(currentUser.id, 'student', studentResults);
        if (!studentSaveResult.success) {
          console.warn('保存学生测评结果失败:', studentSaveResult.error);
        }
      }

      // 保存家长测评结果（如果存在）
      const parentResultsStr = localStorage.getItem(`testResults_parent_${currentUser.id}`);
      if (parentResultsStr) {
        const parentResults = JSON.parse(parentResultsStr);
        const parentSaveResult = await this.saveTestResults(currentUser.id, 'parent', parentResults);
        if (!parentSaveResult.success) {
          console.warn('保存家长测评结果失败:', parentSaveResult.error);
        }
      }

      return { success: true, message: '数据同步成功' };
    } catch (error) {
      console.error('同步数据失败:', error);
      return { success: false, error: '同步数据失败' };
    }
  }
}

// 创建单例实例
export const databaseService = new DatabaseService();
export default databaseService;