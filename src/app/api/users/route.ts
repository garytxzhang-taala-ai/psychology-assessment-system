import { NextRequest, NextResponse } from 'next/server';

// 内存存储（仅用于演示，生产环境应使用数据库）
let usersData: any[] = [];

// 读取用户数据
function readUsers() {
  return usersData;
}

// 写入用户数据
function writeUsers(users: any[]) {
  try {
    usersData = users;
    return true;
  } catch (error) {
    console.error('写入用户数据失败:', error);
    return false;
  }
}

// GET - 获取所有用户
export async function GET() {
  try {
    const users = readUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取用户数据失败' },
      { status: 500 }
    );
  }
}

// POST - 创建或更新用户
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const users = readUsers();
    
    // 查找是否已存在该用户
    const existingUserIndex = users.findIndex((user: any) => user.id === userData.id);
    
    if (existingUserIndex >= 0) {
      // 更新现有用户
      users[existingUserIndex] = {
        ...users[existingUserIndex],
        ...userData,
        updatedAt: new Date().toISOString()
      };
    } else {
      // 创建新用户
      const newUser = {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
    }
    
    const success = writeUsers(users);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: existingUserIndex >= 0 ? '用户信息更新成功' : '用户创建成功',
        data: userData
      });
    } else {
      return NextResponse.json(
        { success: false, error: '保存用户数据失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('处理用户数据失败:', error);
    return NextResponse.json(
      { success: false, error: '处理用户数据失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新用户测评结果
export async function PUT(request: NextRequest) {
  try {
    const { userId, updates, role, testResults } = await request.json();
    const users = readUsers();
    
    const userIndex = users.findIndex((user: any) => user.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 如果有通用更新数据，应用更新
    if (updates) {
      Object.assign(users[userIndex], updates);
    }
    
    // 兼容旧的测评结果更新方式
    if (role && testResults) {
      if (role === 'student') {
        users[userIndex].studentResults = testResults;
        users[userIndex].studentCompleted = true;
      } else if (role === 'parent') {
        users[userIndex].parentResults = testResults;
        users[userIndex].parentCompleted = true;
        
        // 如果双方都完成了，生成综合报告
        if (users[userIndex].studentResults && users[userIndex].parentResults) {
          users[userIndex].combinedResults = {
            student: users[userIndex].studentResults,
            parent: users[userIndex].parentResults,
            timestamp: new Date().toISOString()
          };
        }
      }
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    
    const success = writeUsers(users);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: '用户数据更新成功',
        data: users[userIndex]
      });
    } else {
      return NextResponse.json(
        { success: false, error: '保存用户数据失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('更新用户数据失败:', error);
    return NextResponse.json(
      { success: false, error: '更新用户数据失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    const users = readUsers();
    
    const userIndex = users.findIndex((user: any) => user.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 删除用户
    users.splice(userIndex, 1);
    
    const success = writeUsers(users);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: '用户删除成功'
      });
    } else {
      return NextResponse.json(
        { success: false, error: '删除用户数据失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('删除用户数据失败:', error);
    return NextResponse.json(
      { success: false, error: '删除用户数据失败' },
      { status: 500 }
    );
  }
}