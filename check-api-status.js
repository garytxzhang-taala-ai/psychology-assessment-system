#!/usr/bin/env node

// DeepSeek API状态检测工具
const fs = require('fs');

function loadEnvVars() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    const env = {};
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    
    return env;
  } catch (error) {
    console.error('无法读取.env文件:', error.message);
    return {};
  }
}

async function checkDeepSeekAPI() {
  const env = loadEnvVars();
  const apiKey = env.DEEPSEEK_API_KEY;
  const baseUrl = env.DEEPSEEK_BASE_URL;
  
  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    console.log('❌ DeepSeek API Key 未配置或无效');
    return false;
  }
  
  if (!baseUrl) {
    console.log('❌ DeepSeek Base URL 未配置');
    return false;
  }
  
  console.log('🔍 正在检测 DeepSeek API 连接状态...');
  console.log(`📡 API地址: ${baseUrl}`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      console.log(`✅ DeepSeek API 连接成功!`);
      console.log(`⏱️  响应时间: ${responseTime}ms`);
      
      if (responseTime > 5000) {
        console.log('⚠️  响应时间较长，可能影响用户体验');
      } else if (responseTime > 3000) {
        console.log('⚠️  响应时间偏长');
      } else {
        console.log('🚀 响应速度良好');
      }
      
      return true;
    } else {
      console.log(`❌ DeepSeek API 请求失败: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        console.log('🔑 可能是API密钥无效或已过期');
      } else if (response.status === 429) {
        console.log('🚫 API请求频率限制，请稍后重试');
      } else if (response.status >= 500) {
        console.log('🔧 DeepSeek服务器内部错误');
      }
      
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('❌ DeepSeek API 请求超时（10秒）');
      console.log('🌐 可能是网络连接问题或服务器响应慢');
    } else {
      console.log(`❌ DeepSeek API 连接失败: ${error.message}`);
      console.log('🌐 请检查网络连接');
    }
    return false;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('🔍 DeepSeek API 状态检测工具');
  console.log('='.repeat(50));
  
  const isConnected = await checkDeepSeekAPI();
  
  console.log('\n' + '='.repeat(50));
  if (isConnected) {
    console.log('✅ 总结: DeepSeek API 工作正常');
    console.log('💡 如果用户仍遇到问题，可能是间歇性网络问题');
  } else {
    console.log('❌ 总结: DeepSeek API 连接异常');
    console.log('🔧 建议: 系统将自动使用备用回复机制');
  }
  console.log('='.repeat(50));
}

main().catch(console.error);