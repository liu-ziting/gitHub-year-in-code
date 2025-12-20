<template>
  <div class="max-w-4xl mx-auto flex justify-between items-center mb-4 md:mb-6 px-2 md:px-0">
    <button @click="$emit('backToHome')" class="text-gray-500 text-sm hover:text-white">← 返回</button>
    <button 
      @click="handleDownload" 
      :disabled="isDownloading"
      class="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 md:px-6 py-2 rounded-full text-xs font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95"
    >
      {{ isDownloading ? '海报生成中...' : '保存海报' }}
    </button>
  </div>

  <!-- 截图区域 -->
  <div id="captureArea" class="max-w-4xl mx-auto glass p-2 md:p-10 relative overflow-hidden">
    <!-- 截图专用背景 -->
    <div class="absolute inset-0 opacity-30 pointer-events-none">
      <div class="w-full h-full" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>
    
    <!-- 内容区域 -->
    <div class="relative z-10">
    <!-- 头部 -->
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 text-center md:text-left">
      <div class="relative w-24 h-24 flex-shrink-0">
        <!-- 加载中占位 -->
        <div v-if="!avatarLoaded && !avatarError" class="absolute inset-0 bg-white/5 animate-pulse rounded-3xl border-2 border-white/10 flex items-center justify-center">
          <span class="text-xs text-gray-500">...</span>
        </div>
        <!-- 错误占位 -->
        <div v-if="avatarError" class="absolute inset-0 bg-slate-800 rounded-3xl border-2 border-white/10 flex items-center justify-center">
          <span class="text-2xl">👤</span>
        </div>
        <img 
          v-show="!avatarError"
          :src="userData.avatar_url" 
          crossorigin="anonymous"
          class="w-24 h-24 rounded-3xl border-2 border-white/10 shadow-2xl transition-opacity duration-300"
          :class="avatarLoaded ? 'opacity-100' : 'opacity-0'"
          alt="Avatar"
          @load="avatarLoaded = true"
          @error="avatarError = true"
        >
      </div>
      <div class="flex-1">
        <h2 class="text-4xl font-black tracking-tighter">{{ userData.name || userData.login || '---' }}</h2>
        <p class="text-gray-400 text-sm mt-2 max-w-lg">{{ userData.bio || 'GitHub Data Specialist' }}</p>
        <div class="flex justify-center md:justify-start gap-2 mt-4">
          <span class="bg-teal-500/20 text-teal-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
            {{ userData.rank || 'Seeker' }}
          </span>
          <span class="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
            ID: #{{ userData.reportId || '0000' }}
          </span>
        </div>
      </div>
      <div class="hidden md:block opacity-20 text-right">
        <p class="text-xs font-mono">TRACE REPORT</p>
        <p class="text-xs font-mono">2025 VERIFIED</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="space-y-6">
      <!-- 热力图卡片 -->
      <div class="glass p-6 bg-slate-900/30">
        <p class="text-xs text-gray-400 font-bold mb-4 uppercase tracking-wider">{{ userData.totalContributions || 737 }} contributions in 2025</p>
        <div class="chart-scroll relative min-h-[100px]">
          <!-- 加载中占位 -->
          <div v-if="!chartLoaded && !chartError" class="absolute inset-0 bg-white/5 animate-pulse rounded-xl flex items-center justify-center">
            <div class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
              <span class="text-[10px] text-gray-500 font-mono">LOADING HEATMAP...</span>
            </div>
          </div>
          <!-- 错误占位 -->
          <div v-if="chartError" class="absolute inset-0 bg-red-900/10 rounded-xl flex items-center justify-center border border-red-500/20">
            <span class="text-xs text-red-400/70 font-mono">HEATMAP LOAD FAILED</span>
          </div>
          <img 
            v-show="!chartError"
            :src="userData.heatmapUrl" 
            crossorigin="anonymous"
            class="min-w-[600px] md:min-w-0 w-full filter saturate-[1.5] hue-rotate-[290deg] transition-opacity duration-500"
            :class="chartLoaded ? 'opacity-80' : 'opacity-0'"
            alt="GitHub Heatmap"
            @load="chartLoaded = true"
            @error="chartError = true"
          >
        </div>
      </div>

      <!-- 统计卡片网格 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

        <!-- Total Stars -->
        <div class="glass p-4 bg-gradient-to-br from-cyan-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-cyan-400">⭐</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Stars</p>
          </div>
          <div class="text-2xl font-black text-cyan-400">{{ (userData.totalStars || 0).toLocaleString() }}</div>
        </div>

        

        <!-- Top Language -->
        <div class="glass p-4 bg-gradient-to-br from-blue-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-blue-400">🚀</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Top Language</p>
          </div>
          <div class="text-2xl font-black text-blue-400">{{ userData.topLang || 'Vue' }}</div>
        </div>

        <!-- GitHub Seniority -->
        <div class="glass p-4 bg-gradient-to-br from-orange-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-orange-400">⏳</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">GitHub Seniority</p>
          </div>
          <div class="text-2xl font-black text-orange-400">{{ userData.techImpact || '0 days' }}</div>
        </div>

        <!-- Longest Streak -->
        <div class="glass p-4 bg-gradient-to-br from-teal-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-teal-400">⚡</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Longest Streak</p>
          </div>
          <div class="text-2xl font-black text-teal-400">{{ userData.longestStreak || '10' }} days</div>
        </div>

        <!-- Total Commits -->
        <div class="glass p-4 bg-gradient-to-br from-purple-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-purple-400">🏆</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Commits</p>
          </div>
          <div class="text-2xl font-black text-purple-400">{{ userData.totalCommits || userData.totalContributions || 737 }}</div>
        </div>

        <!-- Most Active Month -->
        <div class="glass p-4 bg-gradient-to-br from-pink-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-pink-400">📅</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Most Active Month</p>
          </div>
          <div class="text-2xl font-black text-pink-400">{{ userData.mostActiveMonth || '1月' }}</div>
        </div>

        <!-- Most Active Day -->
        <div class="glass p-4 bg-gradient-to-br from-yellow-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-yellow-400">📊</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Most Active Day</p>
          </div>
          <div class="text-2xl font-black text-yellow-400">{{ userData.mostActiveDay || 'Monday' }}</div>
        </div>


        <!-- Power Level -->
        <div class="glass p-4 bg-gradient-to-br from-amber-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-amber-400">💪</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Power Level</p>
          </div>
          <div class="text-2xl font-black text-amber-400">{{ userData.powerLevel || 'Ninja' }}</div>
        </div>
      </div>

      <!-- 2025 GitHub 之最 -->
      <div class="glass p-4 md:p-6 bg-slate-900/30 border border-white/5">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-xl md:text-2xl">🏆</span>
          <div>
            <h3 class="text-lg md:text-xl font-black text-white uppercase tracking-wider">2025 GITHUB BESTS</h3>
            <p class="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">你的 2025 编程高光时刻</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <span class="text-xl">🌟</span>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">明星项目</p>
              <p class="text-sm font-bold text-white">{{ userData.starRepoName || 'N/A' }} <span class="text-xs font-normal text-gray-500">- 获得了 {{ userData.starRepoStars || 0 }} 颗 Star！</span></p>
            </div>
          </div>
          
          <div class="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <span class="text-xl">💻</span>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">高产代码</p>
              <p class="text-sm font-bold text-white">{{ userData.highCommitRepoName || 'N/A' }} <span class="text-xs font-normal text-gray-500">- 全年贡献了 {{ userData.highCommitRepoCount || 0 }} 次提交！</span></p>
            </div>
          </div>
          
          <div class="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <span class="text-xl">🤝</span>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">协作之星</p>
              <p class="text-sm font-bold text-white">{{ userData.highContributorRepoName || 'N/A' }} <span class="text-xs font-normal text-gray-500">- 吸引了 {{ userData.highContributorRepoCount || 0 }} 位贡献者！</span></p>
            </div>
          </div>
          
          <div class="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <span class="text-xl">📅</span>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">高光时刻</p>
              <p class="text-sm font-bold text-white">{{ userData.mostActiveMonth || '1月' }} <span class="text-xs font-normal text-gray-500">- 是你最活跃的月份！</span></p>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术分布与影响力图表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass p-6 bg-slate-900/30 border border-white/5">
          <div class="flex flex-col gap-1 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">📊</span>
              <h3 class="text-xs font-black text-white uppercase tracking-wider">TECH STACK</h3>
            </div>
            <p class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">技术栈分布 (Top 5)</p>
          </div>
          <div class="h-[180px] relative">
            <canvas id="langChart"></canvas>
          </div>
        </div>
        <div class="glass p-6 bg-slate-900/30 border border-white/5">
          <div class="flex flex-col gap-1 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">📈</span>
              <h3 class="text-xs font-black text-white uppercase tracking-wider">INFLUENCE</h3>
            </div>
            <p class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">影响力排行 (Stars)</p>
          </div>
          <div class="h-[180px] relative">
            <canvas id="starChart"></canvas>
          </div>
        </div>
      </div>

      <!-- 额外统计信息 -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="glass p-4">
          <p class="text-gray-400 text-xs uppercase mb-1">Public Repos</p>
          <p class="text-xl font-bold text-white">{{ userData.public_repos || 0 }}</p>
        </div>
        <div class="glass p-4">
          <p class="text-gray-400 text-xs uppercase mb-1">Followers</p>
          <p class="text-xl font-bold text-white">{{ userData.followers || 0 }}</p>
        </div>
        <div class="glass p-4">
          <p class="text-gray-400 text-xs uppercase mb-1">Following</p>
          <p class="text-xl font-bold text-white">{{ userData.following || 0 }}</p>
        </div>
      </div>

      <!-- AI锐评区域 -->
      <div class="space-y-4">
        <!-- 技术栈年鉴 -->
        <div class="glass p-2 md:p-6 border-l-4 border-l-indigo-500">
          <div class="flex items-center gap-2 md:gap-3 mb-4">
            <span class="text-xl md:text-2xl">🧬</span>
            <div>
              <h3 class="text-lg md:text-xl font-black text-indigo-400 uppercase tracking-wider">TECH STACK YEARBOOK</h3>
              <p class="text-[9px] md:text-[10px] text-indigo-400/70 font-bold uppercase tracking-[0.2em]">技术栈年鉴</p>
            </div>
            <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse ml-auto"></span>
          </div>
          
          <div class="text-sm md:text-base leading-relaxed text-gray-200 min-h-[60px] bg-slate-900/30 rounded-2xl p-4 md:p-6 border border-indigo-500/20 shadow-inner">
            <div class="italic whitespace-pre-wrap">
              <MarkdownText :text="aiContent.analysis || 'AI 正在解码技术序列...'" />
            </div>
          </div>
        </div>

        <!-- 锐评报告 -->
        <div class="glass p-4 md:p-6 border-l-4 border-l-red-500">
          <div class="flex items-center gap-2 md:gap-3 mb-4">
            <span class="text-xl md:text-2xl">💀</span>
            <div>
              <h3 class="text-lg md:text-xl font-black text-red-400 uppercase tracking-wider">CRITICAL REVIEW</h3>
              <p class="text-[9px] md:text-[10px] text-red-400/70 font-bold uppercase tracking-[0.2em]">锐评报告</p>
            </div>
            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></span>
          </div>
          
          <div class="text-sm md:text-base leading-relaxed text-gray-200 min-h-[60px] bg-slate-900/30 rounded-2xl p-4 md:p-6 border border-red-500/20 shadow-inner">
            <div class="italic whitespace-pre-wrap font-bold text-red-300">
              <MarkdownText :text="aiContent.critique || 'AI 正在蓄力攻击...'" />
            </div>
          </div>
        </div>

        <!-- 年度热词 -->
        <div class="glass p-4 md:p-6 border-l-4 border-l-teal-500">
          <div class="flex items-center gap-2 md:gap-3 mb-4">
            <span class="text-xl md:text-2xl">🏷️</span>
            <div>
              <h3 class="text-lg md:text-xl font-black text-teal-400 uppercase tracking-wider">TRENDING KEYWORDS</h3>
              <p class="text-[9px] md:text-[10px] text-teal-400/70 font-bold uppercase tracking-[0.2em]">年度热词</p>
            </div>
            <span class="w-2 h-2 bg-teal-500 rounded-full animate-pulse ml-auto"></span>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <div v-for="tag in aiContent.tags" :key="tag" 
                 class="px-3 py-1 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-teal-500/30 rounded-full text-xs font-bold text-teal-300 hover:scale-105 transition-transform">
              {{ tag }}
            </div>
            <div v-if="!aiContent.tags || aiContent.tags.length === 0" 
                 class="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-xs text-gray-400">
              标签生成中...
            </div>
          </div>
        </div>

      </div>
    </div>

      <!-- Footer -->
      <div class="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center opacity-30 gap-4">
        <div class="flex flex-col items-center md:items-start gap-1">
          <p class="text-[8px] font-mono tracking-widest uppercase text-center md:text-left">Power by Xiaomi Mimo-v2 & GitHub Trace Engine</p>
          <a href="https://github.com/liu-ziting/" target="_blank" class="text-[8px] font-mono tracking-widest uppercase hover:text-white transition-colors border-b border-transparent hover:border-white/40">By github-year-in-code.lz-t.top</a>
        </div>
        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" crossorigin="anonymous" class="w-4 h-4 invert" alt="GitHub">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { UserData } from '../types'
import MarkdownText from './MarkdownText.vue'

const props = defineProps<{
  userData: Partial<UserData>
  aiContent: { analysis: string; critique: string; tags: string[] }
  isLoading: boolean
}>()

const avatarLoaded = ref(false)
const avatarError = ref(false)
const chartLoaded = ref(false)
const chartError = ref(false)
const isDownloading = ref(false)

const emit = defineEmits<{
  backToHome: []
  downloadPoster: []
}>()

// 图表实例引用
let langChartInstance: Chart | null = null
let starChartInstance: Chart | null = null

const initCharts = () => {
  // 销毁旧实例
  if (langChartInstance) langChartInstance.destroy()
  if (starChartInstance) starChartInstance.destroy()

  // 语言占比图 (Doughnut)
  const langCtx = document.getElementById('langChart') as HTMLCanvasElement
  if (langCtx && props.userData.languageStats) {
    langChartInstance = new Chart(langCtx, {
      type: 'doughnut',
      data: {
        labels: props.userData.languageStats.map(s => s.label),
        datasets: [{
          data: props.userData.languageStats.map(s => s.count),
          backgroundColor: [
            'rgba(45, 212, 191, 0.6)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(59, 130, 246, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(236, 72, 153, 0.6)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 9, weight: 'bold' },
              padding: 12,
              boxWidth: 8,
              usePointStyle: true
            }
          }
        }
      }
    })
  }

  // 影响力排行图 (Horizontal Bar)
  const starCtx = document.getElementById('starChart') as HTMLCanvasElement
  if (starCtx && props.userData.starDistribution) {
    starChartInstance = new Chart(starCtx, {
      type: 'bar',
      data: {
        labels: props.userData.starDistribution.map(s => s.label.length > 12 ? s.label.substring(0, 10) + '...' : s.label),
        datasets: [{
          label: 'Stars',
          data: props.userData.starDistribution.map(s => s.count),
          backgroundColor: 'rgba(139, 92, 246, 0.4)',
          borderColor: 'rgba(139, 92, 246, 0.8)',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 12
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 8 } }
          },
          y: {
            grid: { display: false },
            ticks: { 
              color: 'rgba(255, 255, 255, 0.8)', 
              font: { size: 9, weight: 'bold' },
              padding: 8
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    })
  }
}

onMounted(() => {
  if (props.userData.languageStats) {
    initCharts()
  }
})

// 监听数据变化重新渲染
watch(() => props.userData, (newVal) => {
  if (newVal.languageStats) {
    // 延迟确保 DOM 已更新
    setTimeout(initCharts, 200)
  }
}, { deep: true })

const handleDownload = async () => {
  isDownloading.value = true
  try {
    await emit('downloadPoster')
  } finally {
    // 延迟恢复状态，给截图留出一点点时间
    setTimeout(() => {
      isDownloading.value = false
    }, 1000)
  }
}
</script>