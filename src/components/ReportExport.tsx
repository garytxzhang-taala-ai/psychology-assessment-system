'use client';

import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, Image } from 'lucide-react';

interface ReportExportProps {
  userResult: any;
  className?: string;
}

const ReportExport: React.FC<ReportExportProps> = ({ userResult, className = '' }) => {
  const exportToPDF = async () => {
    try {
      // 获取结果页面的内容
      const element = document.getElementById('results-content');
      if (!element) {
        alert('无法找到报告内容');
        return;
      }

      // 使用html2canvas截图
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // 创建PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4宽度
      const pageHeight = 295; // A4高度
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 添加第一页
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 如果内容超过一页，添加更多页面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 下载PDF
      const fileName = `ACE动机测评报告_${userResult?.motivationType || '未知类型'}_${new Date().toLocaleDateString()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('导出PDF失败:', error);
      alert('导出PDF失败，请稍后重试');
    }
  };

  const exportToPNG = async () => {
    try {
      const element = document.getElementById('results-content');
      if (!element) {
        alert('无法找到报告内容');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `ACE动机测评报告_${userResult?.motivationType || '未知类型'}_${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出PNG失败:', error);
      alert('导出PNG失败，请稍后重试');
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <button
        onClick={exportToPDF}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <FileText className="w-4 h-4" />
        导出PDF报告
      </button>
      
      <button
        onClick={exportToPNG}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Image className="w-4 h-4" />
        导出PNG图片
      </button>
    </div>
  );
};

export default ReportExport;