'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, BarChart3, MessageCircle, Brain, User, LogOut, History } from 'lucide-react';

const navigationItems = [
  {
    name: '首页',
    href: '/',
    icon: Home,
  },
  {
    name: '问卷测评',
    href: '/questionnaire',
    icon: FileText,
  },
  {
    name: '测评结果',
    href: '/results',
    icon: BarChart3,
  },
  {
    name: 'AI 解读',
    href: '/chat',
    icon: MessageCircle,
  },
  {
    name: '用户管理',
    href: '/admin',
    icon: Brain,
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    // 监听localStorage变化，实时更新用户状态
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('currentUser');
      if (updatedUser) {
        setCurrentUser(JSON.parse(updatedUser));
      } else {
        setCurrentUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 也监听自定义事件，用于同一页面内的状态更新
    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem('currentUser');
      if (updatedUser) {
        setCurrentUser(JSON.parse(updatedUser));
      } else {
        setCurrentUser(null);
      }
    };
    
    window.addEventListener('userStatusChanged', handleUserUpdate);
    
    return () => {
       window.removeEventListener('storage', handleStorageChange);
       window.removeEventListener('userStatusChanged', handleUserUpdate);
     };
   }, []);

  const handleLogout = async () => {
    // 获取当前用户信息，用于清理相关数据
    const currentUserData = currentUser;
    
    // 在退出登录前，先尝试同步数据到数据库
    if (currentUserData && currentUserData.id) {
      try {
        // 动态导入数据库服务
        const { databaseService } = await import('../utils/database');
        const syncResult = await databaseService.syncLocalStorageToDatabase();
        if (syncResult.success) {
          console.log('数据同步成功');
        } else {
          console.warn('数据同步失败:', syncResult.error);
        }
      } catch (error) {
        console.error('同步数据时出错:', error);
      }
    }
    
    // 清除当前用户信息
    localStorage.removeItem('currentUser');
    
    // 如果有当前用户数据，清理该用户相关的所有临时数据
    if (currentUserData && currentUserData.id) {
      const userId = currentUserData.id;
      
      // 清理问卷进度数据
      localStorage.removeItem(`questionnaire_progress_student_${userId}`);
      localStorage.removeItem(`questionnaire_progress_parent_${userId}`);
      
      // 清理测评结果数据
      localStorage.removeItem(`testResults_student_${userId}`);
      localStorage.removeItem(`testResults_parent_${userId}`);
      localStorage.removeItem(`combinedResults_${userId}`);
      
      // 清理临时报告数据
      localStorage.removeItem('studentDetailReport');
      localStorage.removeItem('temp_combinedResults');
      localStorage.removeItem('temp_studentDetailReport');
      localStorage.removeItem('temp_testResults');
      localStorage.removeItem('showStudentDetailFirst');
      
      // 清理用户信息缓存
      localStorage.removeItem(`userInfo_${userId}`);
    }
    
    // 清理其他可能的临时数据
    localStorage.removeItem('questionnaireResult');
    localStorage.removeItem('testResult');
    
    setCurrentUser(null);
    // 触发自定义事件通知其他组件用户状态变化
    window.dispatchEvent(new Event('userStatusChanged'));
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Taala ACE</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">欢迎，{currentUser.studentName || currentUser.name}</span>
                  <Link
                    href="/history"
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <History size={16} />
                    <span>历史报告</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    <span>退出</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <User size={16} />
                  <span>登录</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <IconComponent size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}