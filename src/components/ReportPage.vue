<template>
  <div class="max-w-4xl mx-auto flex justify-between items-center mb-4 md:mb-6 px-2 md:px-0">
    <button @click="$emit('backToHome')" class="text-gray-500 text-sm hover:text-white">← 返回</button>
    <!-- <button @click="$emit('downloadPoster')" class="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 md:px-6 py-2 rounded-full text-xs font-bold shadow-lg">下载海报</button> -->
  </div>

  <!-- 截图区域 -->
  <div id="captureArea" class="max-w-4xl mx-auto glass p-6 md:p-10 relative overflow-hidden">
    <!-- 截图专用背景 -->
    <div class="absolute inset-0 opacity-30 pointer-events-none">
      <div class="w-full h-full" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>
    
    <!-- 内容区域 -->
    <div class="relative z-10">
    <!-- 头部 -->
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 text-center md:text-left">
      <img 
        :src="userData.avatar_url" 
        crossorigin="anonymous"
        class="w-24 h-24 rounded-3xl border-2 border-white/10 shadow-2xl"
        alt="Avatar"
      >
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
        <div class="chart-scroll">
          <img 
            :src="userData.heatmapUrl" 
            crossorigin="anonymous"
            class="min-w-[600px] md:min-w-0 w-full filter saturate-[1.5] hue-rotate-[290deg] opacity-80"
            alt="GitHub Heatmap"
          >
        </div>
      </div>

      <!-- 统计卡片网格 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Universal Rank -->
        <div class="glass p-4 bg-gradient-to-br from-orange-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-orange-400">👑</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Universal Rank</p>
          </div>
          <div class="text-2xl font-black text-orange-400">{{ userData.universalRank || 'Top 5%' }}</div>
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
          <div class="text-2xl font-black text-pink-400">{{ userData.mostActiveMonth || 'February' }}</div>
        </div>

        <!-- Most Active Day -->
        <div class="glass p-4 bg-gradient-to-br from-yellow-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-yellow-400">📊</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Most Active Day</p>
          </div>
          <div class="text-2xl font-black text-yellow-400">{{ userData.mostActiveDay || 'Monday' }}</div>
        </div>

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

        <!-- Power Level -->
        <div class="glass p-4 bg-gradient-to-br from-amber-900/20 to-transparent">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-amber-400">💪</span>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Power Level</p>
          </div>
          <div class="text-2xl font-black text-amber-400">{{ userData.powerLevel || 'Ninja' }}</div>
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
        <!-- 技术标签 -->
        <div class="glass p-4 md:p-6 border-l-4 border-l-indigo-500">
          <div class="flex items-center gap-2 md:gap-3 mb-4">
            <span class="text-xl md:text-2xl">🏷️</span>
            <div>
              <h3 class="text-lg md:text-xl font-black text-indigo-400 uppercase tracking-wider">技术标签</h3>
              <p class="text-[9px] md:text-[10px] text-indigo-400/70 font-bold uppercase tracking-[0.2em]">Tech Tags</p>
            </div>
            <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse ml-auto"></span>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <div v-for="tag in aiContent.tags" :key="tag" 
                 class="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300 hover:scale-105 transition-transform">
              {{ tag }}
            </div>
            <div v-if="!aiContent.tags || aiContent.tags.length === 0" 
                 class="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-xs text-gray-400">
              标签生成中...
            </div>
          </div>
        </div>

        <!-- 技术性格分析 -->
        <div class="glass p-4 md:p-6 border-l-4 border-l-purple-500">
          <div class="flex items-center gap-2 md:gap-3 mb-4">
            <span class="text-xl md:text-2xl">🧠</span>
            <div>
              <h3 class="text-lg md:text-xl font-black text-purple-400 uppercase tracking-wider">技术性格</h3>
              <p class="text-[9px] md:text-[10px] text-purple-400/70 font-bold uppercase tracking-[0.2em]">Personality Analysis</p>
            </div>
            <span class="w-2 h-2 bg-purple-500 rounded-full animate-pulse ml-auto"></span>
          </div>
          
          <div class="text-sm md:text-base leading-relaxed text-gray-200 min-h-[80px] bg-slate-900/30 rounded-2xl p-3 md:p-4 border border-purple-500/20">
            <div class="italic">
              <MarkdownText :text="aiContent.personality || 'AI 正在分析您的技术性格倾向...'" />
            </div>
          </div>
        </div>

        <!-- 2026预测 -->
        <div class="glass p-4 md:p-6 border-l-4 border-l-red-500">
          <div class="flex items-center gap-2 md:gap-3 mb-4">
            <span class="text-xl md:text-2xl">🔥</span>
            <div>
              <h3 class="text-lg md:text-xl font-black text-red-400 uppercase tracking-wider">2026预测</h3>
              <p class="text-[9px] md:text-[10px] text-red-400/70 font-bold uppercase tracking-[0.2em]">Future Prediction</p>
            </div>
            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></span>
          </div>
          
          <div class="text-sm md:text-base leading-relaxed text-gray-200 min-h-[80px] bg-slate-900/30 rounded-2xl p-3 md:p-4 border border-red-500/20">
            <div class="italic">
              <MarkdownText :text="aiContent.prediction || 'AI 正在预测您2026年可能掉进的坑...'" />
            </div>
          </div>
        </div>

        <!-- AI分析底部装饰 -->
        <div class="glass p-4 border border-white/10">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>毒舌指数</span>
                <span class="text-red-400 font-bold">MAX</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>准确度</span>
                <span class="text-teal-400 font-bold">98.7%</span>
              </div>
            </div>
            <div class="text-xs text-gray-500 font-mono">
              Powered by Xiaomi Mimo-v2
            </div>
          </div>
          
          <div class="w-full bg-gray-700 rounded-full h-1">
            <div class="bg-gradient-to-r from-purple-500 via-red-500 to-orange-500 h-1 rounded-full animate-pulse" style="width: 100%"></div>
          </div>
        </div>
      </div>
    </div>

      <!-- Footer -->
      <div class="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center opacity-30 gap-4">
        <p class="text-[8px] font-mono tracking-widest uppercase">Power by Xiaomi Mimo-v2 & GitHub Trace Engine</p>
        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" crossorigin="anonymous" class="w-4 h-4 invert" alt="GitHub">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserData } from '../types'
import MarkdownText from './MarkdownText.vue'

defineProps<{
  userData: Partial<UserData>
  aiContent: {personality: string, prediction: string, tags: string[]}
  isLoading: boolean
}>()

defineEmits<{
  backToHome: []
  downloadPoster: []
}>()
</script>