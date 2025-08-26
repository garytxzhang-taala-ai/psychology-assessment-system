'use client';

import React from 'react';
import { MotivationType } from '@/types';
import { Star, Target, Compass, Hammer, Zap, Heart } from 'lucide-react';

interface MotivationTypeCardProps {
  motivationType: MotivationType;
}

const typeIcons = {
  '梦想者': Star,
  '成就者': Target,
  '探索者': Compass,
  '建设者': Hammer,
  '挑战者': Zap,
  '支持者': Heart,
};

const typeColors = {
  '梦想者': 'from-purple-400 to-pink-400',
  '成就者': 'from-blue-400 to-indigo-400',
  '探索者': 'from-green-400 to-teal-400',
  '建设者': 'from-orange-400 to-red-400',
  '挑战者': 'from-red-400 to-pink-400',
  '支持者': 'from-yellow-400 to-orange-400',
};

export default function MotivationTypeCard({ motivationType }: MotivationTypeCardProps) {
  const IconComponent = typeIcons[motivationType.name as keyof typeof typeIcons];
  const colorClass = typeColors[motivationType.name as keyof typeof typeColors];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* 头部渐变背景 */}
      <div className={`bg-gradient-to-r ${colorClass} p-6 text-white`}>
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <IconComponent size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center">{motivationType.name}</h2>
        <p className="text-center text-white text-opacity-90 mt-2">
          {motivationType.description}
        </p>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {/* 特征 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            核心特征
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {motivationType.characteristics.map((characteristic, index) => (
              <div key={index} className="flex items-start">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700 text-sm">{characteristic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 优势 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            学习优势
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {motivationType.strengths.map((strength, index) => (
              <div key={index} className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700 text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 挑战 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            需要关注
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {motivationType.challenges.map((challenge, index) => (
              <div key={index} className="flex items-start">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700 text-sm">{challenge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}