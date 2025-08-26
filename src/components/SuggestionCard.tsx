'use client';

import React from 'react';
import { Suggestion } from '../types';
import { Lightbulb, Target, Users, BookOpen, Zap, Heart } from 'lucide-react';

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
}

const categoryIcons = {
  '学习策略': BookOpen,
  '目标设定': Target,
  '社交互动': Users,
  '自我激励': Zap,
  '情感支持': Heart,
  '技能提升': Lightbulb,
};

const categoryColors = {
  '学习策略': 'bg-blue-100 text-blue-800',
  '目标设定': 'bg-green-100 text-green-800',
  '社交互动': 'bg-purple-100 text-purple-800',
  '自我激励': 'bg-red-100 text-red-800',
  '情感支持': 'bg-yellow-100 text-yellow-800',
  '技能提升': 'bg-indigo-100 text-indigo-800',
};

export default function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  // 根据建议的维度或类型来确定分类
  const getCategory = (suggestion: Suggestion) => {
    if (suggestion.dimension === 'autonomy') return '自我激励';
    if (suggestion.dimension === 'competence') return '技能提升';
    if (suggestion.dimension === 'engagement') return '学习策略';
    return '学习策略'; // 默认分类
  };
  
  const category = getCategory(suggestion);
  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Lightbulb;
  const colorClass = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-blue-50 rounded-full p-2 mr-3">
            <IconComponent size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{suggestion.title}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${colorClass}`}>
              {category}
            </span>
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </div>
      </div>

      {/* 内容 */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {suggestion.content}
      </p>

      {/* 关键词标签 */}
      {suggestion.keywords && suggestion.keywords.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">关键词：</h4>
          <div className="flex flex-wrap gap-1">
            {suggestion.keywords.map((keyword, keywordIndex) => (
              <span key={keywordIndex} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 优先级指示器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">优先级：</span>
          <div className="flex space-x-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= (suggestion.priority === 'high' ? 3 : suggestion.priority === 'medium' ? 2 : 1)
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {suggestion.dimension && `针对：${suggestion.dimension}`}
        </span>
      </div>
    </div>
  );
}