<template>
  <div>
    <!-- 动态背景 -->
    <div class="grid-bg"></div>
    <div class="blob" style="top:10%; right:10%;"></div>
    <div class="blob" style="bottom:10%; left:10%; background: var(--teal);"></div>

    <!-- 首页 -->
    <div v-if="currentPage === 'landing'" id="landingPage" class="min-h-screen flex flex-col items-center px-4 py-12 md:py-24">
      <LandingPage 
        @start-analysis="startAnalysis" 
        @show-error="(msg) => showToast(msg, 'error')"
      />
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

    <!-- 弹窗通知 -->
    <Toast 
      :visible="toast.visible" 
      :message="toast.message" 
      :type="toast.type"
      @close="toast.visible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LandingPage from './components/LandingPage.vue'
import ReportPage from './components/ReportPage.vue'
import Toast from './components/Toast.vue'
import * as htmlToImage from 'html-to-image'
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

// Toast 状态
const toast = ref({
  visible: false,
  message: '',
  type: 'error' as 'error' | 'success'
})

const showToast = (message: string, type: 'error' | 'success' = 'error') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => {
    toast.value.visible = false
  }, 4000)
}

// 使用 Cloudflare Workers 代理（不需要 API_KEY 了）
const WORKERS_URL = 'https://github-api-ai.lz-t.top/'

// 开始分析
const startAnalysis = async (username: string) => {
  if (!username.trim()) {
    showToast('请输入有效的 GitHub 用户名', 'error')
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

    // 成功提示
    showToast(`成功获取 ${username} 的数据`, 'success')

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

    const tags = tagsStr.replace(/[\[\]"]/g, '').split(/[,，\s]+/).filter((t: string) => t.trim()).slice(0, 10)

    // 打字机效果
    typeWriter(analysis, critique, tags)

  } catch (err) {
    showToast('数据溯源失败：' + err, 'error')
    backToHome()
  } finally {
    isLoading.value = false
  }
}

// 调用AI接口
const callMimoAI = async (type: 'analysis' | 'critique' | 'tags', data: { login: string; stars: number; lang: string; topRepo: string }) => {
  let prompt = ''
  if (type === 'analysis') {
    prompt = `你是技术趋势分析专家。基于以下数据：

- 用户身份：${data.login}
- 技术影响力：${data.stars}
- 核心开发语言：${data.lang}
- 旗舰项目：${data.topRepo}

请直接生成一份**2025年度技术总结报告**。要求如下：

1.  用犀利、专业的语言直接剖析其技术栈选择、工程实践特点与项目贡献，避免使用“用户”、“该用户”等客套前缀。
2.  重点突出其在过去一年表现出的技术偏好、代码质量与架构决策特点。
3.  结尾用一句话预测其在2026年最可能爆发或转型的技术方向。
4.  整篇分析需高度凝练，控制在100字以内，像一份机密的技术档案。

例如：
> 主力栈${data.lang}，擅长高Star项目架构。代码追求极致简洁，倾向工具链与开发者体验优化。2026年可能向AI工程化或边缘计算领域纵深切入。`
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

    // 2. 使用 html-to-image 捕获
    // html-to-image 会保留 backdrop-blur 和大部分现代 CSS
    const dataUrl = await htmlToImage.toPng(captureArea, {
      backgroundColor: "#030712",
      pixelRatio: 2,
      skipAutoScale: true,
      cacheBust: true,
      style: {
        borderRadius: '0',
        margin: '0',
        transform: 'none',
        left: '0',
        top: '0',
        position: 'relative'
      }
    })
    
    // 3. 执行下载
    const link = document.createElement('a')
    link.download = `GitHub-Trace-2025-${userData.value.login || 'user'}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
  } catch (error) {
     console.error('截图失败:', error)
     showToast('海报生成失败，请尝试在电脑端操作或直接截图分享。', 'error')
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