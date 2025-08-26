'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    studentName: '',
    studentAge: '',
    studentGender: '',
    school: '',
    grade: '',
    parentRole: '',
    parentName: '',
    parentAge: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('开始处理...')

    try {
      // 简化的用户信息
      const userInfo = {
        id: Date.now().toString(),
        username: `${formData.studentName}_${Date.now()}`,
        studentName: formData.studentName,
        studentAge: formData.studentAge,
        studentGender: formData.studentGender,
        school: formData.school,
        grade: formData.grade,
        parentRole: formData.parentRole,
        parentName: formData.parentName,
        parentAge: formData.parentAge,
        parentOccupation: '测试',
        createdAt: new Date().toISOString(),
        studentCompleted: false,
        parentCompleted: false
      }
      
      setMessage('保存到localStorage...')
      // 保存到localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      users.push(userInfo)
      localStorage.setItem('users', JSON.stringify(users))
      localStorage.setItem('currentUser', JSON.stringify(userInfo))
      
      setMessage('保存成功，准备跳转...')
      
      // 延迟跳转以便查看消息
      setTimeout(() => {
        router.push('/questionnaire?role=student')
      }, 1000)
      
    } catch (error) {
      console.error('错误:', error)
      setMessage('保存失败: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            测试登录功能
          </h2>
          {message && (
            <p className="mt-2 text-center text-sm text-blue-600">{message}</p>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">学生姓名</label>
              <input
                name="studentName"
                type="text"
                required
                value={formData.studentName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="请输入学生姓名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">学生年龄</label>
              <select
                name="studentAge"
                required
                value={formData.studentAge}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">请选择年龄</option>
                <option value="10">10岁</option>
                <option value="12">12岁</option>
                <option value="15">15岁</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">学生性别</label>
              <select
                name="studentGender"
                required
                value={formData.studentGender}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">请选择性别</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">学校</label>
              <input
                name="school"
                type="text"
                required
                value={formData.school}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="请输入学校名称"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">年级</label>
              <select
                name="grade"
                required
                value={formData.grade}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">请选择年级</option>
                <option value="小学五年级">小学五年级</option>
                <option value="初中二年级">初中二年级</option>
                <option value="高中一年级">高中一年级</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">家长身份</label>
              <select
                name="parentRole"
                required
                value={formData.parentRole}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">请选择身份</option>
                <option value="父亲">父亲</option>
                <option value="母亲">母亲</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">家长姓名</label>
              <input
                name="parentName"
                type="text"
                required
                value={formData.parentName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="请输入家长姓名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">家长年龄</label>
              <select
                name="parentAge"
                required
                value={formData.parentAge}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">请选择年龄</option>
                <option value="35">35岁</option>
                <option value="40">40岁</option>
                <option value="45">45岁</option>
              </select>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? '处理中...' : '测试登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
