'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, GraduationCap, Users, Briefcase, Calendar } from 'lucide-react'
import { databaseService } from '../../utils/database'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    // 学生信息
    studentName: '',
    studentAge: '',
    studentGender: '',
    studentGrade: '',
    school: '',
    city: '',
    // 家长信息
    parentRole: '',
    parentName: '',
    parentAge: '',
    parentOccupation: '',
    parentPhone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 学生信息验证
    if (!formData.studentName.trim()) {
      newErrors.studentName = '请输入学生姓名'
    }
    if (!formData.studentAge) {
      newErrors.studentAge = '请选择学生年龄'
    }
    if (!formData.studentGender) {
      newErrors.studentGender = '请选择学生性别'
    }
    if (!formData.studentGrade) {
      newErrors.studentGrade = '请选择学生年级'
    }
    if (!formData.school.trim()) {
      newErrors.school = '请输入学校名称'
    }
    if (!formData.city.trim()) {
      newErrors.city = '请输入所在城市'
    }

    // 家长信息验证
    if (!formData.parentRole) {
      newErrors.parentRole = '请选择家长身份'
    }
    if (!formData.parentName.trim()) {
      newErrors.parentName = '请输入家长姓名'
    }
    if (!formData.parentAge) {
      newErrors.parentAge = '请选择家长年龄'
    }
    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = '请输入手机号码'
    } else if (!/^1[3-9]\d{9}$/.test(formData.parentPhone)) {
      newErrors.parentPhone = '请输入正确的手机号码'
    }

    console.log('表单验证结果:', { formData, newErrors, isValid: Object.keys(newErrors).length === 0 })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('表单提交开始', formData)
    
    if (!validateForm()) {
      console.log('表单验证失败', errors)
      return
    }

    setIsLoading(true)
    console.log('开始保存用户信息')

    try {
      // 生成用户名（使用学生姓名+时间戳）
      const username = `${formData.studentName}_${Date.now()}`
      
      const userInfo = {
        id: Date.now().toString(),
        username,
        studentName: formData.studentName,
        studentAge: formData.studentAge,
        studentGender: formData.studentGender,
        studentGrade: formData.studentGrade,
        school: formData.school,
        city: formData.city,
        parentRole: formData.parentRole,
        parentName: formData.parentName,
        parentAge: formData.parentAge,
        parentOccupation: formData.parentOccupation || '未填写',
        parentPhone: formData.parentPhone,
        createdAt: new Date().toISOString(),
        studentCompleted: false,
        parentCompleted: false
      }
      
      console.log('用户信息准备完成', userInfo)
      
      // 保存用户信息到localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      users.push(userInfo)
      localStorage.setItem('users', JSON.stringify(users))
      localStorage.setItem('currentUser', JSON.stringify(userInfo))
      
      // 触发自定义事件通知Navigation组件更新用户状态
      window.dispatchEvent(new Event('userStatusChanged'))
      
      console.log('localStorage保存成功')
      
      // 立即跳转到问卷页面
      console.log('准备跳转到问卷页面')
      setIsLoading(false)
      
      // 使用setTimeout确保状态更新完成后再跳转
      setTimeout(() => {
        router.push('/questionnaire?role=student')
      }, 100)
      
      // 异步保存到数据库，不阻塞用户体验
      databaseService.saveUser(userInfo)
        .then(dbResult => {
          console.log('数据库保存结果:', dbResult)
          if (!dbResult.success) {
            console.warn('数据库保存失败:', dbResult.error)
          }
        })
        .catch(error => {
          console.error('数据库保存异常:', error)
        })
      
    } catch (error) {
      console.error('登录过程出错:', error)
      setErrors({ general: '信息保存失败，请重试' })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            学习动机测评信息登记
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请填写学生和家长的基本信息，完成后即可开始测评
          </p>
        </div>
        
        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {/* 学生信息部分 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
              学生信息
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                  学生姓名 *
                </label>
                <div className="mt-1">
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.studentName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="请输入学生姓名"
                  />
                </div>
                {errors.studentName && <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>}
              </div>
              
              <div>
                <label htmlFor="studentAge" className="block text-sm font-medium text-gray-700">
                  学生年龄 *
                </label>
                <div className="mt-1">
                  <select
                    id="studentAge"
                    name="studentAge"
                    value={formData.studentAge}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.studentAge ? 'border-red-300' : 'border-gray-300'
                    } text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    <option value="">请选择年龄</option>
                    {Array.from({ length: 18 }, (_, i) => i + 6).map(age => (
                      <option key={age} value={age}>{age}岁</option>
                    ))}
                  </select>
                </div>
                {errors.studentAge && <p className="mt-1 text-sm text-red-600">{errors.studentAge}</p>}
              </div>
              
              <div>
                <label htmlFor="studentGender" className="block text-sm font-medium text-gray-700">
                  学生性别 *
                </label>
                <div className="mt-1">
                  <select
                    id="studentGender"
                    name="studentGender"
                    value={formData.studentGender}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.studentGender ? 'border-red-300' : 'border-gray-300'
                    } text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    <option value="">请选择性别</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                {errors.studentGender && <p className="mt-1 text-sm text-red-600">{errors.studentGender}</p>}
              </div>
              
              <div>
                <label htmlFor="studentGrade" className="block text-sm font-medium text-gray-700">
                  学生年级 *
                </label>
                <div className="mt-1">
                  <select
                    id="studentGrade"
                    name="studentGrade"
                    value={formData.studentGrade}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.studentGrade ? 'border-red-300' : 'border-gray-300'
                    } text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    <option value="">请选择年级</option>
                    <option value="小学一年级">小学一年级</option>
                    <option value="小学二年级">小学二年级</option>
                    <option value="小学三年级">小学三年级</option>
                    <option value="小学四年级">小学四年级</option>
                    <option value="小学五年级">小学五年级</option>
                    <option value="小学六年级">小学六年级</option>
                    <option value="初中一年级">初中一年级</option>
                    <option value="初中二年级">初中二年级</option>
                    <option value="初中三年级">初中三年级</option>
                    <option value="高中一年级">高中一年级</option>
                    <option value="高中二年级">高中二年级</option>
                    <option value="高中三年级">高中三年级</option>
                  </select>
                </div>
                {errors.studentGrade && <p className="mt-1 text-sm text-red-600">{errors.studentGrade}</p>}
              </div>
              
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                  学校 *
                </label>
                <div className="mt-1">
                  <input
                    id="school"
                    name="school"
                    type="text"
                    value={formData.school}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.school ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="请输入学校名称"
                  />
                </div>
                {errors.school && <p className="mt-1 text-sm text-red-600">{errors.school}</p>}
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  所在城市 *
                </label>
                <div className="mt-1">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="请输入所在城市"
                  />
                </div>
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
            </div>
          </div>
          
          {/* 家长信息部分 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              家长信息
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="parentRole" className="block text-sm font-medium text-gray-700">
                  家长身份 *
                </label>
                <div className="mt-1">
                  <select
                    id="parentRole"
                    name="parentRole"
                    value={formData.parentRole}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.parentRole ? 'border-red-300' : 'border-gray-300'
                    } text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    <option value="">请选择身份</option>
                    <option value="父亲">父亲</option>
                    <option value="母亲">母亲</option>
                    <option value="其他监护人">其他监护人</option>
                  </select>
                </div>
                {errors.parentRole && <p className="mt-1 text-sm text-red-600">{errors.parentRole}</p>}
              </div>
              
              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">
                  家长姓名 *
                </label>
                <div className="mt-1">
                  <input
                    id="parentName"
                    name="parentName"
                    type="text"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.parentName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="请输入家长姓名"
                  />
                </div>
                {errors.parentName && <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>}
              </div>
              
              <div>
                <label htmlFor="parentAge" className="block text-sm font-medium text-gray-700">
                  家长年龄 *
                </label>
                <div className="mt-1">
                  <select
                    id="parentAge"
                    name="parentAge"
                    value={formData.parentAge}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.parentAge ? 'border-red-300' : 'border-gray-300'
                    } text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  >
                    <option value="">请选择年龄</option>
                    {Array.from({ length: 41 }, (_, i) => i + 25).map(age => (
                      <option key={age} value={age}>{age}岁</option>
                    ))}
                  </select>
                </div>
                {errors.parentAge && <p className="mt-1 text-sm text-red-600">{errors.parentAge}</p>}
              </div>
              
              <div>
                <label htmlFor="parentOccupation" className="block text-sm font-medium text-gray-700">
                  职业（选填）
                </label>
                <div className="mt-1">
                  <input
                    id="parentOccupation"
                    name="parentOccupation"
                    type="text"
                    value={formData.parentOccupation}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="请输入职业（可选）"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">
                  手机号码 *
                </label>
                <div className="mt-1">
                  <input
                    id="parentPhone"
                    name="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.parentPhone ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="请输入手机号码"
                  />
                </div>
                {errors.parentPhone && <p className="mt-1 text-sm text-red-600">{errors.parentPhone}</p>}
              </div>
            </div>
          </div>
          
          {errors.general && (
            <div className="text-center">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : '完成登记，开始测评'}
            </button>
          </div>
          
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              返回首页
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}