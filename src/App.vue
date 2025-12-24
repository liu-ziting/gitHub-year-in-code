<template>
    <div>
        <!-- 动态背景 -->
        <div class="grid-bg"></div>
        <div class="blob" style="top: 10%; right: 10%"></div>
        <div class="blob" style="bottom: 10%; left: 10%; background: var(--teal)"></div>

        <!-- 首页 -->
        <div v-if="currentPage === 'landing'" id="landingPage" class="min-h-screen flex flex-col items-center px-4 py-12 md:py-24">
            <LandingPage :is-loading="isLoading" @start-analysis="startAnalysis" @show-error="msg => showToast(msg, 'error')" @show-about="currentPage = 'about'" />

            <footer class="text-center pt-12 text-slate-500 text-xs space-y-2">
                <p>© GitHub 2025 Year in Code. Built with ❤️ for Developers.</p>
                <p class="opacity-50 font-mono tracking-wider flex items-center justify-center gap-2">
                    <span>Powered by <span class="text-teal-400/80">Gemini-3-Flash</span></span>
                    <span class="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <a href="https://github2025.lz-t.top/" class="hover:text-teal-400 transition-colors">github2025.lz-t.top</a>
                </p>
            </footer>
        </div>

        <!-- 关于页 -->
        <div v-if="currentPage === 'about'" class="animate__animated animate__fadeIn">
            <AboutPage @back="currentPage = 'landing'" />
        </div>

        <!-- 报告页 -->
        <div v-if="currentPage === 'report'" id="reportPage" class="animate__animated animate__fadeIn px-2 md:px-4 py-4 md:py-8">
            <ReportPage :user-data="userData" :ai-content="aiContent" :is-loading="isLoading" @back-to-home="backToHome" @download-poster="downloadPoster" />
        </div>

        <!-- 弹窗通知 -->
        <Toast :visible="toast.visible" :message="toast.message" :type="toast.type" @close="toast.visible = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LandingPage from './components/LandingPage.vue'
import ReportPage from './components/ReportPage.vue'
import AboutPage from './components/AboutPage.vue'
import Toast from './components/Toast.vue'
import * as htmlToImage from 'html-to-image'
import type { UserData, GitHubUser, GitHubRepo } from './types'
import { callMimoAI } from './services/ai'

// 响应式数据
const currentPage = ref<'landing' | 'report' | 'about'>('landing')
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

// 开始分析
const startAnalysis = async (username: string) => {
    if (isLoading.value) return
    if (!username.trim()) {
        showToast('请输入有效的 GitHub 用户名', 'error')
        return
    }

    isLoading.value = true

    try {
        // 1. 获取用户信息
        const userRes = await fetch(`https://api.github.com/users/${username}`)
        if (userRes.status === 403) {
            throw 'GitHub API 速率达到上限。请稍后再试，或连接 VPN 切换 IP。'
        }
        const user = await userRes.json()
        if (user.message === 'Not Found') throw '未找到该用户'
        if (user.message && user.message.includes('rate limit')) {
            throw 'GitHub API 速率达到上限。请稍后再试。'
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
                throw 'GitHub API 速率达到上限。请稍后再试，或连接 VPN 切换 IP。'
            }

            const d = await r.json()
            if (!d || d.length === 0) break
            if (d.message && d.message.includes('rate limit')) {
                throw 'GitHub API 速率达到上限。请稍后再试。'
            }

            repos = repos.concat(d)
            page++
        }

        // 3. 数据处理
        // 过滤掉 fork 的项目，并严格限制在 2025 年有活跃（更新或推送）的项目
        const originalRepos = repos.filter(r => !r.fork)
        const repos2025 = originalRepos.filter(r => {
            const updatedAt = new Date(r.updated_at).getFullYear()
            const pushedAt = r.pushed_at ? new Date(r.pushed_at).getFullYear() : 0
            const createdAt = new Date(r.created_at).getFullYear()
            return updatedAt === 2025 || pushedAt === 2025 || createdAt === 2025
        })

        // 统计数据仅针对 2025 年活跃的项目
        const totalStars = repos2025.reduce((s, r) => s + r.stargazers_count, 0)
        const langMap: Record<string, number> = {}
        repos2025.forEach(r => r.language && (langMap[r.language] = (langMap[r.language] || 0) + 1))

        // 技术栈星图数据 (基于 2025 活跃项目)
        const languageStats = Object.entries(langMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, count]) => ({ label, count }))

        const topLang = languageStats[0]?.label || 'Unknown'

        // 影响力分布数据 (Top 5 Stars in 2025 Repos)
        const starDistribution = [...repos2025]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5)
            .map(r => ({ label: r.name, count: r.stargazers_count }))

        // 2025 专项统计 (明星项目、协作之星)
        const starRepo = [...repos2025].sort((a, b) => b.stargazers_count - a.stargazers_count)[0] || null
        const collaborationRepo = [...repos2025].sort((a, b) => b.forks_count - a.forks_count)[0] || null

        // --- 2025 真实贡献数据获取 ---
        let totalContributions = 0
        let longestStreak = 0
        let mostActiveMonth = 'Jan'
        let mostActiveDay = 'Monday'
        let contributionData: { date: string; count: number }[] = []

        try {
            // 尝试获取真实的贡献数据
            const contribRes = await fetch(`https://github-contributions-api.deno.dev/${username}.json`)
            if (contribRes.ok) {
                const data = await contribRes.json()
                // 过滤 2025 年的数据
                contributionData = data.contributions.filter((c: any) => c.date.startsWith('2025'))

                totalContributions = contributionData.reduce((sum, c) => sum + c.count, 0)

                // 计算最长连续贡献
                let currentStreak = 0
                contributionData.forEach(c => {
                    if (c.count > 0) {
                        currentStreak++
                        if (currentStreak > longestStreak) longestStreak = currentStreak
                    } else {
                        currentStreak = 0
                    }
                })

                // 计算最活跃月份
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const monthContributions: Record<number, number> = {}
                contributionData.forEach(c => {
                    const m = new Date(c.date).getMonth()
                    monthContributions[m] = (monthContributions[m] || 0) + c.count
                })
                const topMonth = Object.entries(monthContributions).sort((a, b) => b[1] - a[1])[0]
                if (topMonth) mostActiveMonth = months[Number(topMonth[0])] || 'Jan'

                // 计算最活跃的一天
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                const dayContributions: Record<number, number> = {}
                contributionData.forEach(c => {
                    const d = new Date(c.date).getDay()
                    dayContributions[d] = (dayContributions[d] || 0) + c.count
                })
                const topDay = Object.entries(dayContributions).sort((a, b) => b[1] - a[1])[0]
                if (topDay) mostActiveDay = days[Number(topDay[0])]
            }
        } catch (e) {
            console.warn('Failed to fetch real contribution data, falling back to deterministic simulation', e)
        }

        // 如果获取失败，使用确定性模拟 (基于用户名，不再随机)
        const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const deterministicValue = (offset: number, max: number) => {
            const val = Math.abs(Math.sin(seed + offset) * 10000)
            return Math.floor((val - Math.floor(val)) * max)
        }

        if (totalContributions === 0) {
            const base = repos2025.length * 15 + user.followers * 2
            totalContributions = Math.floor(base * (0.8 + deterministicValue(1, 40) / 100)) || 20 + deterministicValue(2, 50)
            longestStreak = Math.floor(Math.min(30, (totalContributions / 10) * (0.5 + deterministicValue(3, 50) / 100))) || deterministicValue(4, 10)

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            mostActiveMonth = months[deterministicValue(5, 12)]
            mostActiveDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][deterministicValue(6, 7)]
        }

        // 2025 高产项目模拟 (确定性)
        const highCommitRepo = repos2025.length > 0 ? repos2025[deterministicValue(7, repos2025.length)] : null
        const highCommitCount = Math.floor(totalContributions * (0.2 + deterministicValue(8, 30) / 100))

        // 报告 ID (确定性)
        const reportId = 1000 + deterministicValue(9, 9000)

        // 头衔判断 (Rank System) - 基于 2025 表现
        let rank = '潜行者'

        // 技术领袖系列
        if (totalStars > 10000 && user.followers > 5000) {
            rank = '开源传奇'
        } else if (totalStars > 5000 && user.followers > 1000) {
            rank = '年度技术领袖'
        } else if (totalStars > 2000 && user.followers > 500) {
            rank = '社区领袖'

            // 贡献者系列
        } else if (totalStars > 1000) {
            rank = '核心贡献者'
        } else if (totalStars > 500 && repos2025.length > 5) {
            rank = '优质贡献者'
        } else if (totalStars > 200) {
            rank = '活跃贡献者'

            // 构建者系列
        } else if (repos2025.length > 20) {
            rank = '超级构建者'
        } else if (repos2025.length > 10) {
            rank = '高产构建者'
        } else if (repos2025.length > 5) {
            rank = '积极构建者'

            // 影响者系列
        } else if (totalStars > 100) {
            rank = '技术影响者'
        } else if (totalStars > 50) {
            rank = '赛博漫步者'
        } else if (totalStars > 20) {
            rank = '代码探索者'

            // 工匠系列
        } else if (totalStars > 0) {
            rank = '代码工匠'
        } else if (repos2025.length > 3) {
            rank = '持续贡献者'
        } else if (repos2025.length > 1) {
            rank = '热情新手'
        } else if (repos2025.length > 0) {
            rank = '入门学徒'
        }

        // 码龄计算 (Open Source Seniority) - 保持不变，因为这是个人属性
        const createdDate = new Date(user.created_at)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - createdDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const techImpact = diffDays > 365 ? `${(diffDays / 365).toFixed(1)} years` : `${diffDays} days`

        // Power Level 计算 (战力等级) - 仅基于 2025 数据
        let powerLevel = 'E (Rookie)'
        const score = totalStars * 10 + repos2025.length * 5
        if (score > 1000) powerLevel = 'SSS (Godly)'
        else if (score > 500) powerLevel = 'SS (Legendary)'
        else if (score > 200) powerLevel = 'S (Elite)'
        else if (score > 100) powerLevel = 'A (Professional)'
        else if (score > 50) powerLevel = 'B (Active)'
        else if (score > 20) powerLevel = 'C (Novice)'
        else powerLevel = 'D (Fighter)'

        // 设置用户数据
        userData.value = {
            ...user,
            public_repos: repos2025.length, // 仅展示 2025 活跃仓库数
            totalStars,
            topLang,
            rank,
            techImpact,
            powerLevel,
            totalContributions,
            totalCommits: totalContributions,
            longestStreak,
            mostActiveMonth,
            mostActiveDay,
            reportId,
            heatmapUrl: `/api/ghchart/8b5cf6/${username}`,
            starRepoName: starRepo?.name || 'N/A',
            starRepoStars: starRepo?.stargazers_count || 0,
            highCommitRepoName: highCommitRepo?.name || 'N/A',
            highCommitRepoCount: highCommitCount,
            highContributorRepoName: collaborationRepo?.name || 'N/A',
            highContributorRepoCount: (collaborationRepo?.forks_count || 0) + deterministicValue(10, 15),
            languageStats,
            starDistribution
        }

        // 5. 调用 Mimo AI
        const aiInputData = {
            login: user.login,
            stars: totalStars,
            lang: topLang,
            topRepo: starRepo ? starRepo.name : 'N/A',
            totalContributions,
            longestStreak,
            mostActiveMonth,
            mostActiveDay,
            publicRepos: originalRepos.length,
            followers: user.followers,
            topLangs: languageStats.map(l => l.label)
        }

        const [analysis, critique, tagsStr] = await Promise.all([callMimoAI('analysis', aiInputData), callMimoAI('critique', aiInputData), callMimoAI('tags', aiInputData)])

        const tags = tagsStr
            .replace(/[\[\]"]/g, '')
            .split(/[,，\s]+/)
            .filter((t: string) => t.trim())
            .slice(0, 10)

        // 打字机效果
        typeWriter(analysis, critique, tags)
    } catch (err) {
        showToast('数据溯源失败：' + err, 'error')
        backToHome()
    } finally {
        isLoading.value = false
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
        await Promise.all(
            Array.from(images).map(img => {
                if (img.complete) return Promise.resolve()
                return new Promise(resolve => {
                    img.onload = resolve
                    img.onerror = resolve
                })
            })
        )

        // 2. 使用 html-to-image 捕获
        // html-to-image 会保留 backdrop-blur 和大部分现代 CSS
        const dataUrl = await htmlToImage.toPng(captureArea, {
            backgroundColor: '#030712',
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
