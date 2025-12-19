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
const aiContent = ref<{ analysis: string; critique: string; tags: string[] }>({
  analysis: '',
  critique: '',
  tags: []
})
const isLoading = ref(false)

// 使用 Cloudflare Workers 代理（不需要 API_KEY 了）
const WORKERS_URL = 'https://github-api-ai.lz-t.top/'

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
    if (userRes.status === 403) {
      throw "GitHub API 速率达到上限。请稍后再试，或连接 VPN 切换 IP。"
    }
    const user = await userRes.json()
    if (user.message === "Not Found") throw "未找到该用户"
    if (user.message && user.message.includes("rate limit")) {
      throw "GitHub API 速率达到上限。请稍后再试。"
    }

    // 切换到报告页
    currentPage.value = 'report'

    // 2. 递归拉取全量仓库
    let repos: GitHubRepo[] = []
    let page = 1
    while (page <= 5) {
      const r = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`)
      
      if (r.status === 403) {
        throw "GitHub API 速率达到上限。请稍后再试，或连接 VPN 切换 IP。"
      }
      
      const d = await r.json()
      if (!d || d.length === 0) break
      if (d.message && d.message.includes("rate limit")) {
        throw "GitHub API 速率达到上限。请稍后再试。"
      }
      
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
    const [analysis, critique, tagsStr] = await Promise.all([
      callMimoAI('analysis', {
        login: user.login,
        stars: totalStars,
        lang: topLang,
        topRepo: starRepo ? starRepo.name : 'N/A'
      }),
      callMimoAI('critique', {
        login: user.login,
        stars: totalStars,
        lang: topLang,
        topRepo: starRepo ? starRepo.name : 'N/A'
      }),
      callMimoAI('tags', {
        login: user.login,
        stars: totalStars,
        lang: topLang,
        topRepo: starRepo ? starRepo.name : 'N/A'
      })
    ])

    const tags = tagsStr.replace(/[\[\]"]/g, '').split(/[,，\s]+/).filter(t => t.trim()).slice(0, 10)

    // 打字机效果
    typeWriter(analysis, critique, tags)

  } catch (err) {
    alert('数据溯源失败：' + err)
    backToHome()
  } finally {
    isLoading.value = false
  }
}

// 调用AI接口
const callMimoAI = async (type: 'analysis' | 'critique' | 'tags', data: { login: string; stars: number; lang: string; topRepo: string }) => {
  let prompt = ''
  if (type === 'analysis') {
    prompt = `你是 GitHub 技术分析官。基于数据：用户名${data.login}, Star总计${data.stars}, 主修语言${data.lang}, 代表作${data.topRepo}。
    请生成一份专业的个人技术画像和2026年技术趋势预测（约100字）。
    
    要求：
    1. **禁止**以"用户 xxx 是一位..."、"该用户..."、"基于数据..."等废话开头。
    2. 直接切入技术核心，分析其技术栈深度、代码风格及工程能力。
    3. 语气要犀利、专业，像是一份绝密的人才评估报告。
    4. 预测2026年他最可能深耕的技术方向。
    
    回复内容直接展示，不需要标题。`
  } else if (type === 'critique') {
    prompt = `你是 GitHub 灵魂分析官。基于数据：用户名${data.login}, Star总计${data.stars}, 主修语言${data.lang}, 代表作${data.topRepo}。
    请生成一个让他破防的梗，要求极其毒舌但精准（约200字）。
    回复内容直接展示，不需要标题。`
  } else {
    prompt = `你是 GitHub 标签生成器。基于数据：用户名${data.login}, Star总计${data.stars}, 主修语言${data.lang}, 代表作${data.topRepo}。
    分析其开源贡献与技术特点，生成5-10个总结性、富有洞察力的中文身份标签。标签需幽默风趣、生动贴切，反映其技术栈、项目特点或开发风格。请直接输出以逗号分隔的标签，无需其他说明。

    例如可能的输出风格：
    代码艺术家，全栈乐高玩家，深夜提交侠，Python魔术师，开源传教士，Bug狩猎者；
    限制：
    用逗号分隔，不能重复。
    回复内容直接展示标签，不需要标题。`
  }

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
    return resData.choices[0].message.content || ''
  } catch (e) {
    console.error('AI调用失败:', e)
    return type === 'tags' ? "技术宅,代码人,探索者" : "AI 脑机连接异常，但在代码维度里，你已经是不可忽视的奇点。"
  }
}

// 打字机效果
const typeWriter = (analysis: string, critique: string, tags: string[]) => {
  aiContent.value = { analysis: '', critique: '', tags: tags }
  
  let i = 0
  const analysisTimer = setInterval(() => {
    if (i < analysis.length) {
      aiContent.value.analysis += analysis.charAt(i)
      i++
    } else {
      clearInterval(analysisTimer)
      
      let j = 0
      const critiqueTimer = setInterval(() => {
        if (j < critique.length) {
          aiContent.value.critique += critique.charAt(j)
          j++
        } else {
          clearInterval(critiqueTimer)
        }
      }, 30)
    }
  }, 30)
}

// 返回首页
const backToHome = () => {
  currentPage.value = 'landing'
  userData.value = {}
  aiContent.value = { analysis: '', critique: '', tags: [] }
}

// 下载海报
const downloadPoster = async () => {
  const captureArea = document.getElementById('captureArea')
  if (!captureArea) return

  try {
    // 1. 预处理：确保所有图片都已加载
    const images = captureArea.querySelectorAll('img')
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise(resolve => {
        img.onload = resolve
        img.onerror = resolve
      })
    }))

    // 2. 使用 html2canvas 捕获，通过 onclone 强制桌面端布局
    const canvas = await html2canvas(captureArea, {
      backgroundColor: "#030712",
      useCORS: true,
      scale: 2,
      logging: false,
      width: 800, // 强制导出宽度为 800px，确保触发 md: 栅格
      windowWidth: 1200, // 模拟大屏浏览器窗口
      onclone: (clonedDoc) => {
        const clonedArea = clonedDoc.getElementById('captureArea')
        if (clonedArea) {
          clonedArea.style.width = '800px'
          clonedArea.style.padding = '40px'
          clonedArea.style.borderRadius = '0px' // 导出图通常不需要外层圆角
          
          // 移除所有 backdrop-blur，因为 html2canvas 不支持，改为纯色背景
          const glasses = clonedArea.querySelectorAll('.glass')
          glasses.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.backdropFilter = 'none'
              el.style.webkitBackdropFilter = 'none'
              el.style.backgroundColor = 'rgba(15, 23, 42, 0.8)' // 更加深沉的背景
            }
          })

          // 强制修正栅格系统：html2canvas 有时无法识别 md: 前缀
          const grids = clonedArea.querySelectorAll('.grid')
          grids.forEach(grid => {
            if (grid instanceof HTMLElement) {
              if (grid.classList.contains('md:grid-cols-4')) {
                grid.style.display = 'grid'
                grid.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))'
              } else if (grid.classList.contains('md:grid-cols-3')) {
                grid.style.display = 'grid'
                grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))'
              }
            }
          })
        }
      }
    })
    
    // 3. 执行下载
    const link = document.createElement('a')
    link.download = `GitHub-Trace-2025-${userData.value.login || 'user'}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
  } catch (error) {
    console.error('截图失败:', error)
    alert('海报生成失败，请尝试在电脑端操作或直接截图分享。')
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