import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import Navigation from '../components/Navigation'
import LoadingSpinner from '../components/LoadingSpinner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Taala ACE 学习动机诊断系统',
  description: '基于ACE动机模型的智能学习动机诊断与建议系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Suspense fallback={<div className="h-16 bg-white shadow-lg border-b"></div>}>
            <Navigation />
          </Suspense>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}