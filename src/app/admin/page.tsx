'use client';

import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Eye, Trash2, Users, FileText, BarChart3, Brain, TrendingUp } from 'lucide-react';
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface UserData {
  id: string;
  name: string;
  email: string;
  userInfo?: any;
  studentResults?: any;
  parentResults?: any;
  combinedResults?: any;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const allUsers: UserData[] = [];
    
    try {
      // 从localStorage获取用户列表
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const usersList = JSON.parse(usersData);
        
        usersList.forEach((userData: any) => {
          const userId = userData.id;
          
          // 获取测评结果
          const studentResults = localStorage.getItem(`testResults_student_${userId}`);
          const parentResults = localStorage.getItem(`testResults_parent_${userId}`);
          const combinedResults = localStorage.getItem(`combinedResults_${userId}`);
          
          allUsers.push({
            id: userId,
            name: userData.studentName || userData.name || '未知用户',
            email: userData.email || `${userData.studentName}@example.com`,
            userInfo: userData,
            studentResults: studentResults ? JSON.parse(studentResults) : null,
            parentResults: parentResults ? JSON.parse(parentResults) : null,
            combinedResults: combinedResults ? JSON.parse(combinedResults) : null,
            createdAt: userData.createdAt || new Date().toISOString()
          });
        });
      }
      
      // 也检查API获取的用户数据
      fetch('/api/users')
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data) {
            data.data.forEach((userData: any) => {
              // 避免重复添加
              if (!allUsers.find(u => u.id === userData.id)) {
                const userId = userData.id;
                
                // 优先使用API返回的测评结果，如果没有则从localStorage获取
                const studentResults = userData.studentResults || 
                  (localStorage.getItem(`testResults_student_${userId}`) ? 
                   JSON.parse(localStorage.getItem(`testResults_student_${userId}`)!) : null);
                const parentResults = userData.parentResults || 
                  (localStorage.getItem(`testResults_parent_${userId}`) ? 
                   JSON.parse(localStorage.getItem(`testResults_parent_${userId}`)!) : null);
                const combinedResults = userData.combinedResults || 
                  (localStorage.getItem(`combinedResults_${userId}`) ? 
                   JSON.parse(localStorage.getItem(`combinedResults_${userId}`)!) : null);
                
                allUsers.push({
                  id: userId,
                  name: userData.studentName || userData.name || '未知用户',
                  email: userData.email || `${userData.studentName}@example.com`,
                  userInfo: userData,
                  studentResults: studentResults,
                  parentResults: parentResults,
                  combinedResults: combinedResults,
                  createdAt: userData.createdAt || new Date().toISOString()
                });
              }
            });
            setUsers([...allUsers]);
          }
        })
        .catch(error => {
          console.error('Error fetching users from API:', error);
        });
        
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    
    setUsers(allUsers);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'completed') return matchesSearch && user.combinedResults;
    if (filterType === 'incomplete') return matchesSearch && !user.combinedResults;
    
    return matchesSearch;
  });

  const exportToCSV = () => {
    const csvData: string[] = [];
    const headers = [
      '用户ID', '姓名', '邮箱', '注册时间',
      '学生姓名', '学生年龄', '学生年级',
      '家长姓名', '家长关系', '联系电话',
      '学生测评完成', '家长测评完成', '综合报告生成'
    ];
    
    csvData.push(headers.join(','));
    
    filteredUsers.forEach(user => {
      const row: (string | number)[] = [
        user.id,
        user.name,
        user.email,
        new Date(user.createdAt).toLocaleDateString(),
        user.userInfo?.studentName || '',
        user.userInfo?.studentAge || '',
        user.userInfo?.studentGrade || '',
        user.userInfo?.parentName || '',
        user.userInfo?.parentRelation || '',
        user.userInfo?.contactPhone || '',
        user.studentResults ? '是' : '否',
        user.parentResults ? '是' : '否',
        user.combinedResults ? '是' : '否'
      ];
      csvData.push(row.join(','));
    });
    
    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `用户数据_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const deleteUser = (userId: string) => {
    if (confirm('确定要删除该用户的所有数据吗？此操作不可恢复。')) {
      try {
        // 从localStorage的users数组中删除用户
        const usersData = localStorage.getItem('users');
        if (usersData) {
          const usersList = JSON.parse(usersData);
          const updatedUsers = usersList.filter((user: any) => user.id !== userId);
          localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
        
        // 删除用户相关的测评数据
        localStorage.removeItem(`testResults_student_${userId}`);
        localStorage.removeItem(`testResults_parent_${userId}`);
        localStorage.removeItem(`combinedResults_${userId}`);
        localStorage.removeItem(`questionnaire_progress_student_${userId}`);
        localStorage.removeItem(`questionnaire_progress_parent_${userId}`);
        
        // 如果删除的是当前登录用户，清除登录状态
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const currentUserData = JSON.parse(currentUser);
          if (currentUserData.id === userId) {
            localStorage.removeItem('currentUser');
            window.dispatchEvent(new Event('userStatusChanged'));
          }
        }
        
        // 同时从API删除
        fetch(`/api/users`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        }).catch(error => {
          console.error('Error deleting user from API:', error);
        });
        
        loadUserData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('删除用户时出错，请重试');
      }
    }
  };

  const viewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const getCompletionStatus = (user: UserData) => {
    if (user.combinedResults) return { status: '已完成', color: 'text-green-600 bg-green-100' };
    if (user.studentResults || user.parentResults) return { status: '进行中', color: 'text-yellow-600 bg-yellow-100' };
    return { status: '未开始', color: 'text-gray-600 bg-gray-100' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">用户数据管理</h1>
          <p className="text-gray-600">管理和查看所有用户的测评数据</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成测评</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.combinedResults).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => (u.studentResults || u.parentResults) && !u.combinedResults).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <button
                  onClick={exportToCSV}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  导出CSV数据
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="搜索用户姓名或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部用户</option>
                <option value="completed">已完成测评</option>
                <option value="incomplete">未完成测评</option>
              </select>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学生信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    测评状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const status = getCompletionStatus(user);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {user.userInfo?.studentName || '未填写'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.userInfo?.city || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          {status.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 用户详情模态框 */}
        {showDetails && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">用户详细信息</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>姓名:</strong> {selectedUser.name}</p>
                      <p><strong>邮箱:</strong> {selectedUser.email}</p>
                      <p><strong>注册时间:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* 学生和家长信息 */}
                  {selectedUser.userInfo && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">学生和家长信息</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p><strong>学生姓名:</strong> {selectedUser.userInfo.studentName}</p>
                        <p><strong>学生年龄:</strong> {selectedUser.userInfo.studentAge}</p>
                        <p><strong>所在城市:</strong> {selectedUser.userInfo.city}</p>
                        <p><strong>家长姓名:</strong> {selectedUser.userInfo.parentName}</p>
                        <p><strong>家长关系:</strong> {selectedUser.userInfo.parentRelation}</p>
                        <p><strong>家长手机:</strong> {selectedUser.userInfo.parentPhone}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 测评结果 */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">测评结果</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">学生测评</h4>
                        <p className={selectedUser.studentResults ? 'text-green-600' : 'text-gray-500'}>
                          {selectedUser.studentResults ? '已完成' : '未完成'}
                        </p>
                        {selectedUser.studentResults && (
                          <p className="text-sm text-gray-600 mt-1">
                            完成时间: {new Date(selectedUser.studentResults.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">家长测评</h4>
                        <p className={selectedUser.parentResults ? 'text-green-600' : 'text-gray-500'}>
                          {selectedUser.parentResults ? '已完成' : '未完成'}
                        </p>
                        {selectedUser.parentResults && (
                          <p className="text-sm text-gray-600 mt-1">
                            完成时间: {new Date(selectedUser.parentResults.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">综合报告</h4>
                        <p className={selectedUser.combinedResults ? 'text-green-600' : 'text-gray-500'}>
                          {selectedUser.combinedResults ? '已生成' : '未生成'}
                        </p>
                        {selectedUser.combinedResults && (
                          <div>
                            <p className="text-sm text-gray-600 mt-1">
                              生成时间: {new Date(selectedUser.combinedResults.timestamp).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              报告ID: {selectedUser.combinedResults.reportId || '未知'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 综合报告详细内容 */}
                  {selectedUser.combinedResults && (
                    <div className="md:col-span-2 space-y-6 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Brain className="mr-2" size={20} />
                        综合分析报告内容
                      </h3>
                      
                      {/* 学生和家长对比雷达图 */}
                      <div className="bg-white border rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                          <TrendingUp className="mr-2" size={16} />
                          学生与家长视角对比
                        </h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsRadarChart data={[
                              {
                                dimension: '自主性',
                                student: selectedUser.combinedResults.student.scores.autonomy,
                                parent: selectedUser.combinedResults.parent.scores.autonomy,
                                fullMark: 20
                              },
                              {
                                dimension: '胜任感',
                                student: selectedUser.combinedResults.student.scores.competence,
                                parent: selectedUser.combinedResults.parent.scores.competence,
                                fullMark: 20
                              },
                              {
                                dimension: '参与度',
                                student: selectedUser.combinedResults.student.scores.engagement,
                                parent: selectedUser.combinedResults.parent.scores.engagement,
                                fullMark: 20
                              }
                            ]}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="dimension" />
                              <PolarRadiusAxis angle={90} domain={[0, 20]} />
                              <Radar
                                name="学生视角"
                                dataKey="student"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.3}
                                strokeWidth={2}
                              />
                              <Radar
                                name="家长视角"
                                dataKey="parent"
                                stroke="#EF4444"
                                fill="#EF4444"
                                fillOpacity={0.3}
                                strokeWidth={2}
                              />
                            </RechartsRadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center mt-4 space-x-6">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">学生视角</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">家长视角</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 综合分析结果 */}
                      {selectedUser.combinedResults.analysis && (
                        <div className="bg-white border rounded-lg p-6">
                          <h4 className="text-md font-semibold text-gray-800 mb-4">综合分析结果</h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">认知差异分析</h5>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedUser.combinedResults.analysis.cognitiveDifferences}
                              </p>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">一致性判断</h5>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedUser.combinedResults.analysis.consistencyJudgment}
                              </p>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">亲子关系视角</h5>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedUser.combinedResults.analysis.parentChildPerspective}
                              </p>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">维度差异分析</h5>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedUser.combinedResults.analysis.dimensionDifferences}
                              </p>
                            </div>
                            
                            {selectedUser.combinedResults.analysis.recommendations && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">专家建议</h5>
                                <div className="space-y-2">
                                  {selectedUser.combinedResults.analysis.recommendations.map((recommendation: string, index: number) => (
                                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                                      <div className="flex items-start">
                                        <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                                          {index + 1}
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {recommendation}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}