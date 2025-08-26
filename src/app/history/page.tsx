'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Calendar, User, ArrowLeft } from 'lucide-react'
import { isValidReportId, extractTimestampFromId } from '../../utils/idGenerator'

interface ReportIndexItem {
  userId: string
  type: 'combined' | 'student' | 'parent'
  timestamp: string
  studentName?: string
  parentName?: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [searchId, setSearchId] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allReports, setAllReports] = useState<Array<{ id: string; info: ReportIndexItem }>>([])

  useEffect(() => {
    // 加载所有报告索引
    const reportIndex = JSON.parse(localStorage.getItem('reportIndex') || '{}')
    const reports = Object.entries(reportIndex).map(([id, info]) => ({
      id,
      info: info as ReportIndexItem
    }))
    setAllReports(reports.sort((a, b) => new Date(b.info.timestamp).getTime() - new Date(a.info.timestamp).getTime()))
  }, [])

  const handleSearch = () => {
    if (!searchId.trim()) {
      setError('请输入报告ID')
      return
    }

    if (!isValidReportId(searchId.trim())) {
      setError('报告ID格式不正确，请检查输入')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 从报告索引中查找
      const reportIndex = JSON.parse(localStorage.getItem('reportIndex') || '{}')
      const reportInfo = reportIndex[searchId.trim()]

      if (!reportInfo) {
        setError('未找到该报告ID对应的报告')
        setSearchResult(null)
        setLoading(false)
        return
      }

      // 根据报告类型加载具体数据
      let reportData = null
      if (reportInfo.type === 'combined') {
        // 查找综合报告
        const combinedKey = `combinedResults_${reportInfo.userId}`
        const combinedData = localStorage.getItem(combinedKey)
        if (combinedData) {
          const parsed = JSON.parse(combinedData)
          if (parsed.reportId === searchId.trim()) {
            reportData = parsed
          }
        }
      } else {
        // 查找单个报告
        const resultKey = `testResults_${reportInfo.type}_${reportInfo.userId}`
        const resultData = localStorage.getItem(resultKey)
        if (resultData) {
          const parsed = JSON.parse(resultData)
          if (parsed.reportId === searchId.trim()) {
            reportData = parsed
          }
        }
      }

      if (reportData) {
        setSearchResult(Object.assign({}, reportData, { reportInfo }))
      } else {
        setError('报告数据已损坏或不存在')
        setSearchResult(null)
      }
    } catch (err) {
      setError('查询过程中发生错误')
      setSearchResult(null)
    }

    setLoading(false)
  }

  const handleViewReport = (reportId: string) => {
    setSearchId(reportId)
    handleSearch()
  }

  const handleOpenReport = () => {
    if (searchResult) {
      // 临时保存查询到的报告数据
      if (searchResult.reportInfo.type === 'combined') {
        localStorage.setItem(`temp_combinedResults`, JSON.stringify(searchResult))
        // 跳转到综合报告页面
        router.push('/results?from=history')
      } else if (searchResult.reportInfo.type === 'student') {
        // 学生详细报告
        localStorage.setItem(`temp_studentDetailReport`, JSON.stringify(searchResult))
        // 跳转到学生详细报告页面
        router.push('/results?view=student&from=history')
      } else {
        // 家长报告
        localStorage.setItem(`temp_testResults`, JSON.stringify(searchResult))
        router.push('/results?from=history')
      }
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">历史报告查询</h1>
            </div>
          </div>
          
          {/* 搜索框 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="请输入报告ID（格式：RPT-XXXXXX-XXXXXX）"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '查询中...' : '查询报告'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* 搜索结果 */}
        {searchResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              查询结果
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <p><strong>报告ID：</strong> <span className="font-mono text-blue-600">{searchResult.reportId}</span></p>
                <p><strong>报告类型：</strong> {searchResult.reportInfo.type === 'combined' ? '综合报告' : searchResult.reportInfo.type === 'student' ? '学生报告' : '家长报告'}</p>
                <p><strong>生成时间：</strong> {formatDate(searchResult.timestamp)}</p>
              </div>
              <div className="space-y-2">
                {searchResult.reportInfo.studentName && (
                  <p><strong>学生姓名：</strong> {searchResult.reportInfo.studentName}</p>
                )}
                {searchResult.reportInfo.parentName && (
                  <p><strong>家长姓名：</strong> {searchResult.reportInfo.parentName}</p>
                )}
                {searchResult.motivationType && (
                  <p><strong>动机类型：</strong> {searchResult.motivationType.name}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleOpenReport}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              查看完整报告
            </button>
          </div>
        )}

        {/* 最近报告列表 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="mr-2" size={20} />
            最近生成的报告
          </h2>
          
          {allReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无历史报告</p>
          ) : (
            <div className="space-y-3">
              {allReports.slice(0, 10).map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {report.id}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {report.info.type === 'combined' ? '综合报告' : report.info.type === 'student' ? '学生报告' : '家长报告'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {report.info.studentName && `学生：${report.info.studentName}`}
                        {report.info.studentName && report.info.parentName && ' | '}
                        {report.info.parentName && `家长：${report.info.parentName}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(report.info.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewReport(report.id)}
                      className="ml-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      查看
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}