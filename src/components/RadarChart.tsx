'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  studentData?: {
    autonomy: number;
    competence: number;
    engagement: number;
  };
  parentData?: {
    autonomy: number;
    competence: number;
    engagement: number;
  };
  // 兼容旧的单一数据格式
  autonomy?: number;
  competence?: number;
  engagement?: number;
}

export default function RadarChart({ studentData, parentData, autonomy, competence, engagement }: RadarChartProps) {
  // 构建数据集
  const datasets: any[] = [];
  
  // 如果有学生数据或者使用旧格式
  if (studentData || (autonomy !== undefined && competence !== undefined && engagement !== undefined)) {
    const studentValues = studentData ? 
      [studentData.autonomy, studentData.competence, studentData.engagement] :
      [autonomy!, competence!, engagement!];
    
    datasets.push({
      label: '学生视角',
      data: studentValues,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
    });
  }
  
  // 如果有家长数据
  if (parentData) {
    datasets.push({
      label: '家长视角',
      data: [parentData.autonomy, parentData.competence, parentData.engagement],
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(239, 68, 68, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(239, 68, 68, 1)',
    });
  }

  const data = {
    labels: ['自主性 (Autonomy)', '胜任感 (Competence)', '参与度 (Engagement)'],
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.r}/20`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 20,
        ticks: {
          stepSize: 5,
        },
        pointLabels: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Radar data={data} options={options} />
    </div>
  );
}