<template>
  <div class="text-center max-w-4xl animate__animated animate__fadeIn">
    <div class="inline-block px-4 py-1 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold mb-6 tracking-widest uppercase">
      2025 年度总结报告器
    </div>
    <h1 class="hero-title text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight">
      TRACE YOUR <br>
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-teal-400">CODE SOUL</span>
    </h1>
    <p class="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto px-4">
      接入 <span class="text-white font-bold">Mimo AI</span> 视觉引擎，深度解析你的 GitHub 每一行 Commit，生成专属开发者数字名片。
    </p>

    <!-- 搜索区 -->
    <div class="flex flex-col md:flex-row gap-4 justify-center items-center mb-16 w-full max-w-md mx-auto px-4">
      <input 
        type="text" 
        v-model="username"
        @keyup.enter="handleAnalysis"
        placeholder="输入 GitHub 用户名" 
        class="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 outline-none transition-all input-focus"
      >
      <button 
        @click="handleAnalysis"
        :disabled="isLoading"
        class="w-full md:w-auto whitespace-nowrap bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-teal-400 transition-all shadow-xl active:scale-95 disabled:opacity-50"
      >
        {{ isLoading ? '正在溯源中...' : '立即分析' }}
      </button>
    </div>
  </div>

  <!-- 功能预览 -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 opacity-80">
    <div class="glass p-6">
      <div class="text-teal-400 font-bold mb-2">01. 基因测序</div>
      <p class="text-sm text-gray-500">统计多达 100+ 仓库的语言构成，精准识别你的技术栈倾向。</p>
    </div>
    <div class="glass p-6">
      <div class="text-purple-400 font-bold mb-2">02. 灵魂对谈</div>
      <p class="text-sm text-gray-500">小米 Mimo AI 实时阅读你的数据，生成犀利且独特的个人评价。</p>
    </div>
    <div class="glass p-6">
      <div class="text-pink-400 font-bold mb-2">03. 视觉导出</div>
      <p class="text-sm text-gray-500">一键生成适配朋友圈、Twitter 的高保真海报，带热力图映射。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  startAnalysis: [username: string]
}>()

const username = ref('')
const isLoading = ref(false)

const handleAnalysis = () => {
  if (!username.value.trim()) {
    alert('请输入有效的 GitHub 用户名')
    return
  }
  
  isLoading.value = true
  emit('startAnalysis', username.value.trim())
  
  // 重置loading状态（实际应该由父组件控制）
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}
</script>