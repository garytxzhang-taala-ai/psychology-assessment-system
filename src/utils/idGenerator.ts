/**
 * 生成独立用户ID的工具函数
 */

// 生成基于时间戳和随机数的唯一ID
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomStr}`.toUpperCase()
}

// 生成报告专用的ID（包含前缀）
export function generateReportId(): string {
  const uniqueId = generateUniqueId()
  return `RPT-${uniqueId}`
}

// 验证ID格式
export function isValidReportId(id: string): boolean {
  const pattern = /^RPT-[A-Z0-9]+-[A-Z0-9]+$/
  return pattern.test(id)
}

// 从完整ID中提取时间戳
export function extractTimestampFromId(id: string): number | null {
  try {
    const parts = id.replace('RPT-', '').split('-')
    if (parts.length >= 1) {
      return parseInt(parts[0], 36)
    }
    return null
  } catch {
    return null
  }
}
