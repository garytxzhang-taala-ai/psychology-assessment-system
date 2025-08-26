'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Users, Target, MessageCircle, BarChart3, ArrowRight, Star, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区域 */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              科学 • 专业 • 个性化
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            发现你的
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              学习动机
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            基于科学的ACE动机模型，通过智能问卷诊断你的学习动机类型，
            获得个性化的学习建议和AI深度解读
          </p>
          
          {/* 特色亮点 */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>12题科学问卷</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>6种动机类型</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>个性化建议</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>AI智能解读</span>
            </div>
          </div>
          
          {/* 开始测评按钮 */}
          <div className="flex justify-center mb-12">
            <Link href="/login" className="group">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center">
                <Brain className="h-6 w-6 mr-3" />
                开始学习动机测评
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
          
          {/* 测评流程说明 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">测评流程</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">填写基本信息</h4>
                <p className="text-gray-600 text-sm">学生和家长基本信息登记</p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">双方问卷测评</h4>
                <p className="text-gray-600 text-sm">学生问卷 → 家长问卷</p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">生成综合报告</h4>
                <p className="text-gray-600 text-sm">AI分析 + 个性化建议</p>
              </div>
            </div>
          </div>
        </div>

        {/* 功能特色 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 mb-6">
              <Brain className="h-12 w-12 text-white mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">科学问卷</h3>
            <p className="text-gray-600">基于ACE动机模型的12题专业问卷，快速准确评估学习动机</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 mb-6">
              <BarChart3 className="h-12 w-12 text-white mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">智能分析</h3>
            <p className="text-gray-600">生成个性化动机画像和可视化雷达图，直观了解动机类型</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 mb-6">
              <MessageCircle className="h-12 w-12 text-white mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI建议</h3>
            <p className="text-gray-600">获得个性化成长建议和AI深度解读，助力学习提升</p>
          </div>
        </div>
      </main>
    </div>
  )
}