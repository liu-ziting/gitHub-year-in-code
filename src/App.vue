<template>
  <div>
    <!-- 动态背景 -->
    <div class="grid-bg"></div>
    <div class="blob" style="top:10%; right:10%;"></div>
    <div class="blob" style="bottom:10%; left:10%; background: var(--teal);"></div>

    <!-- 首页 -->
    <div v-if="currentPage === 'landing'" id="landingPage" class="min-h-screen flex flex-col items-center px-4 py-12 md:py-24">
      <LandingPage @start-analysis="startAnalysis" />
    </div>

    <!-- 报告页 -->
    <div v-if="currentPage === 'report'" id="reportPage" class="animate__animated animate__fadeIn px-2 md:px-4 py-4 md:py-8">
      <ReportPage 
        :user-data="userData" 
        :ai-content="aiContent"
        :is-loading="isLoading"
        @back-to-home="backToHome"
        @download-poster="downloadPoster" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LandingPage from './components/LandingPage.vue'
import ReportPage from './components/ReportPage.vue'
import html2canvas from 'html2canvas'
import type { UserData, GitHubUser, GitHubRepo } from './types'

// 响应式数据
const currentPage = ref<'landing' | 'report'>('landing')
const userData = ref<Partial<UserData>>({})
const aiContent = ref<{personality: string, prediction: string, tags: string[]}>({personality: '', prediction: '', tags: []})
const isLoading = ref(false)

// 使用 Cloudflare Workers 代理（不需要 API_KEY 了）
const WORKERS_URL = 'https://icy-sunset-a2a6.liu11onepoint.workers.dev/'

// 开始分析
const startAnalysis = async (username: string) => {
  if (!username.trim()) {
    alert('请输入有效的 GitHub 用户名')
    return
  }

  isLoading.value = true

  try {
    // 1. 获取用户信息
    const userRes = await fetch(`https://api.github.com/users/${username}`)
    const user = await userRes.json()
    if (user.message === "Not Found") throw "未找到该用户"

    // 切换到报告页
    currentPage.value = 'report'

    // 2. 递归拉取全量仓库
    let repos: GitHubRepo[] = []
    let page = 1
    while (page <= 5) {
      const r = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`)
      const d = await r.json()
      if (!d || d.length === 0) break
      repos = repos.concat(d)
      page++
    }

    // 3. 数据处理
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
    const langMap: Record<string, number> = {}
    repos.forEach(r => r.language && (langMap[r.language] = (langMap[r.language] || 0) + 1))
    const topLang = Object.keys(langMap).sort((a,b) => (langMap[b] || 0) - (langMap[a] || 0))[0] || 'Unknown'
    const starRepo = repos.sort((a,b) => b.stargazers_count - a.stargazers_count)[0] || null

    // 计算额外统计数据
    const totalContributions = Math.floor(300 + Math.random() * 500) // 模拟贡献数
    const longestStreak = Math.floor(5 + Math.random() * 25) // 模拟最长连击
    const mostActiveMonth = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'][Math.floor(Math.random() * 12)]
    const mostActiveDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Math.floor(Math.random() * 7)]
    
    // 头衔判断
    let rank = "技术流浪者"
    if(totalStars > 500) rank = "恒星架构师"
    else if(totalStars > 100) rank = "深空漫步者"
    else if(user.followers > 50) rank = "灵感传道士"

    // Universal Rank 计算
    let universalRank = "Top 50%"
    if(totalStars > 1000) universalRank = "Top 1%"
    else if(totalStars > 500) universalRank = "Top 5%"
    else if(totalStars > 100) universalRank = "Top 10%"
    else if(totalStars > 50) universalRank = "Top 25%"

    // Power Level 计算
    let powerLevel = "Rookie"
    if(totalStars > 1000 && user.followers > 100) powerLevel = "Legend"
    else if(totalStars > 500 || user.followers > 50) powerLevel = "Ninja"
    else if(totalStars > 100 || user.followers > 20) powerLevel = "Warrior"
    else if(totalStars > 10 || user.followers > 5) powerLevel = "Fighter"

    // 设置用户数据
    userData.value = {
      ...user,
      totalStars,
      topLang,
      rank,
      universalRank,
      powerLevel,
      totalContributions,
      totalCommits: totalContributions,
      longestStreak,
      mostActiveMonth,
      mostActiveDay,
      reportId: Math.floor(1000 + Math.random() * 9000),
      heatmapUrl: `/api/ghchart/8b5cf6/${username}`
    }

    // 5. 调用 Mimo AI
    const aiResult = await callMimoAI({
      login: user.login,
      stars: totalStars,
      lang: topLang,
      topRepo: starRepo ? starRepo.name : 'N/A'
    })

    // 打字机效果
    typeWriter(aiResult)

  } catch (err) {
    alert('数据溯源失败：' + err)
    backToHome()
  } finally {
    isLoading.value = false
  }
}

// 调用AI接口
const callMimoAI = async (data: { login: string; stars: number; lang: string; topRepo: string }) => {
  const prompt = `你是 GitHub 灵魂分析官。基于数据：用户名${data.login}, Star总计${data.stars}, 主修语言${data.lang}, 代表作${data.topRepo}。
  请生成一份毒舌但专业的个人代码风格画像。
  
  请严格按照以下JSON格式返回，不要添加任何其他内容：
  {
    "personality": "技术性格倾向分析，支持**加粗**和换行",
    "prediction": "2026年最可能掉进的坑，支持**加粗**和换行", 
    "tags": ["标签1", "标签2", "标签3"]
  }
  
  要求：
  1. personality字段：分析他的技术性格倾向，要毒舌但专业，约80字，可以使用**文字**加粗重点
  2. prediction字段：预测2026年他最可能掉进的坑，包含一个让他破防的梗，约70字，可以使用**文字**加粗
  3. tags字段：根据分析总结3-8个标签，体现技术特点和性格，如["完美主义者","框架收集癖","深夜码农"]
  4. 语言要犀利有趣，但保持专业水准
  5. 必须返回有效的JSON格式`
  
  try {
    // 使用 Workers 代理
    const response = await fetch(WORKERS_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      })
    })
    const resData = await response.json()
    const content = resData.choices[0].message.content
    
    try {
      // 尝试解析JSON
      const aiAnalysis = JSON.parse(content)
      return aiAnalysis
    } catch (parseError) {
      // 如果解析失败，返回默认格式
      return {
        personality: content.substring(0, 100) + "...",
        prediction: "2026年最可能在AI大潮中迷失方向，成为那个还在**手写CSS**的古典程序员。",
        tags: ["神秘开发者", "代码隐士", "技术探索者"]
      }
    }
  } catch (e) {
    console.error('AI调用失败:', e)
    return {
      personality: "AI 脑机连接异常，但在代码维度里，你已经是**不可忽视的奇点**。",
      prediction: "2026年最可能掉进的坑就是过度依赖AI，忘记了**编程的本质乐趣**。",
      tags: ["AI依赖症", "代码哲学家", "数字游民"]
    }
  }
}

// 打字机效果
const typeWriter = (aiAnalysis: {personality: string, prediction: string, tags: string[]}) => {
  aiContent.value = {personality: '', prediction: '', tags: aiAnalysis.tags || []}
  
  // 先打personality
  let i = 0
  const personalityTimer = setInterval(() => {
    if (i < aiAnalysis.personality.length) {
      aiContent.value.personality += aiAnalysis.personality.charAt(i)
      i++
    } else {
      clearInterval(personalityTimer)
      
      // 然后打prediction
      let j = 0
      const predictionTimer = setInterval(() => {
        if (j < aiAnalysis.prediction.length) {
          aiContent.value.prediction += aiAnalysis.prediction.charAt(j)
          j++
        } else {
          clearInterval(predictionTimer)
        }
      }, 30)
    }
  }, 30)
}

// 返回首页
const backToHome = () => {
  currentPage.value = 'landing'
  userData.value = {}
  aiContent.value = {personality: '', prediction: '', tags: []}
}

// 下载海报
const downloadPoster = async () => {
  const captureArea = document.getElementById('captureArea')
  if (!captureArea) return

  try {
    // 临时显示更好的背景效果
    const originalStyle = captureArea.style.cssText
    captureArea.style.background = 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #030712 100%)'
    
    // 预处理图片，确保它们不会污染canvas
    const images = captureArea.querySelectorAll('img')
    const imagePromises = Array.from(images).map(async (img) => {
      if (img.src.startsWith('http') && !img.src.includes(window.location.origin)) {
        try {
          // 创建一个新的图片元素
          const newImg = new Image()
          newImg.crossOrigin = 'anonymous'
          
          return new Promise((resolve, reject) => {
            newImg.onload = () => {
              // 创建canvas来转换图片
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              canvas.width = newImg.width
              canvas.height = newImg.height
              ctx?.drawImage(newImg, 0, 0)
              
              try {
                const dataURL = canvas.toDataURL('image/png')
                img.src = dataURL
                resolve(dataURL)
              } catch (e) {
                // 如果还是失败，就隐藏这个图片
                img.style.display = 'none'
                resolve(null)
              }
            }
            newImg.onerror = () => {
              img.style.display = 'none'
              resolve(null)
            }
            newImg.src = img.src
          })
        } catch (e) {
          img.style.display = 'none'
          return null
        }
      }
      return Promise.resolve(null)
    })

    await Promise.all(imagePromises)
    
    // 等待一下让图片加载完成
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const canvas = await html2canvas(captureArea, {
      backgroundColor: "#030712",
      useCORS: true,
      allowTaint: false,
      scale: 2,
      scrollX: 0,
      scrollY: 0,
      width: captureArea.offsetWidth,
      height: captureArea.offsetHeight,
      logging: false,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        // 在克隆的文档中处理图片
        const clonedImages = clonedDoc.querySelectorAll('img')
        clonedImages.forEach(img => {
          if (img.src.startsWith('http') && !img.src.includes(window.location.origin)) {
            img.style.display = 'none'
          }
        })
      }
    })
    
    // 恢复原始样式
    captureArea.style.cssText = originalStyle
    images.forEach(img => {
      img.style.display = ''
    })
    
    const link = document.createElement('a')
    link.download = `GitHub-Trace-2025-${userData.value.login || 'user'}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
    
  } catch (error) {
    console.error('截图失败:', error)
    
    // 如果还是失败，尝试简化版本
    try {
      const canvas = await html2canvas(captureArea, {
        backgroundColor: "#030712",
        useCORS: false,
        allowTaint: true,
        scale: 1,
        ignoreElements: (element) => {
          return element.tagName === 'IMG' && (element as HTMLImageElement).src.startsWith('http') && !(element as HTMLImageElement).src.includes(window.location.origin)
        }
      })
      
      const link = document.createElement('a')
      link.download = `GitHub-Trace-2025-${userData.value.login || 'user'}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (fallbackError) {
      console.error('备用截图也失败:', fallbackError)
      alert('海报生成失败，可能是由于网络图片跨域问题。请稍后重试或联系开发者。')
    }
  }
}

// 加载外部CSS
onMounted(() => {
  // 加载 animate.css
  const animateLink = document.createElement('link')
  animateLink.rel = 'stylesheet'
  animateLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
  document.head.appendChild(animateLink)
})
</script>