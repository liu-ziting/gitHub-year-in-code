<template>
    <div class="min-h-[80vh] flex flex-col items-center justify-center text-center max-w-6xl mx-auto px-4 animate__animated animate__fadeIn">
        <!-- 顶部徽章 -->
        <div
            class="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[10px] md:text-xs font-bold mb-8 tracking-[0.2em] uppercase backdrop-blur-sm"
        >
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            2025 GitHub年度总结生成
        </div>

        <!-- 主标题区 -->
        <div class="relative mb-8">
            <h1 class="hero-title text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
                <span class="inline-block text-white/90">GitHub 2025 </span>
                <span class="inline-block md:ml-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-teal-400">Year in Code</span>
            </h1>
            <p class="text-gray-400 text-xs md:text-base max-w-xl mx-auto font-medium leading-relaxed opacity-60">
                深度解析你的 GitHub 仓库与技术栈 <br class="hidden md:block" />
                接入 <span class="text-white font-bold">MiMo AI</span> 大模型，生成专属开发者数字名片
            </p>
        </div>

        <!-- 搜索交互区 -->
        <div class="w-full max-w-2xl mb-8 scale-110 md:scale-125 transition-transform duration-500">
            <div class="relative group">
                <div
                    class="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-teal-600 rounded-[2rem] blur-xl opacity-30 group-focus-within:opacity-100 transition duration-500 animate-pulse"
                ></div>
                <div
                    class="relative flex flex-col md:flex-row gap-3 bg-slate-950/80 p-2.5 rounded-[2rem] border-2 border-white/20 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)]"
                >
                    <div class="flex-1 flex items-center px-6 py-2">
                        <span class="text-gray-500 mr-3 text-xl">@</span>
                        <input
                            type="text"
                            v-model="username"
                            @keyup.enter="handleAnalysis"
                            placeholder="输入你的 GitHub ID"
                            class="w-full bg-transparent border-none outline-none text-white text-lg placeholder:text-gray-600 font-medium"
                        />
                    </div>
                    <button
                        @click="handleAnalysis"
                        :disabled="isLoading"
                        class="group relative overflow-hidden bg-white text-black font-black px-12 py-4 rounded-[1.5rem] transition-all active:scale-95 disabled:opacity-50"
                    >
                        <div class="relative z-10 flex items-center gap-2">
                            <span>{{ isLoading ? '溯源中...' : '立即分析' }}</span>
                            <span v-if="!isLoading" class="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </button>
                </div>
            </div>

            <!-- 关于项目入口 -->
            <div class="mt-8 flex flex-col items-center">
                <button
                    @click="$emit('showAbout')"
                    class="text-[11px] text-gray-500 hover:text-teal-400 transition-all flex items-center gap-2 uppercase tracking-[0.2em] font-bold group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-teal-500/30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    了解项目背景 & AI 机制
                </button>
            </div>

            <p class="mt-4 text-[10px] text-gray-500 font-mono tracking-widest uppercase opacity-50">PRESS ENTER TO REVEAL YOUR GENE</p>
        </div>

        <!-- 功能特性展示 - 重新设计的卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            <!-- 技术基因 -->
            <div class="group relative glass p-8 border border-white/5 hover:border-indigo-500/30 transition-all duration-500">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <span class="text-4xl font-black">01</span>
                </div>
                <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20">
                    <span class="text-xl">🧬</span>
                </div>
                <h3 class="text-white font-black text-lg mb-3 tracking-tight">技术基因</h3>
                <p class="text-sm text-gray-500 leading-relaxed">
                    深度解码你的技术序列，分析核心语言栈与工程能力，<br />
                    预测 2026 年你将深耕的赛博领地。
                </p>
            </div>

            <!-- 灵魂暴击 -->
            <div class="group relative glass p-8 border border-white/5 hover:border-red-500/30 transition-all duration-500">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <span class="text-4xl font-black">02</span>
                </div>
                <div class="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 border border-red-500/20">
                    <span class="text-xl">💀</span>
                </div>
                <h3 class="text-white font-black text-lg mb-3 tracking-tight">灵魂暴击</h3>
                <p class="text-sm text-gray-500 leading-relaxed">
                    接入 Mimo AI 毒舌引擎，精准捕捉你的代码槽点，<br />
                    生成让你无法反驳的赛博灵魂拷问。
                </p>
            </div>

            <!-- 赛博标签 -->
            <div class="group relative glass p-8 border border-white/5 hover:border-teal-500/30 transition-all duration-500">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <span class="text-4xl font-black">03</span>
                </div>
                <div class="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6 border border-teal-500/20">
                    <span class="text-xl">🏷️</span>
                </div>
                <h3 class="text-white font-black text-lg mb-3 tracking-tight">年度热词</h3>
                <p class="text-sm text-gray-500 leading-relaxed">
                    基于 2025 年度数据建模，提取极具幽默感的身份标签，<br />
                    一键生成高保真数字名片与社交海报。
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    isLoading: boolean
}>()

const emit = defineEmits<{
    startAnalysis: [username: string]
    showError: [message: string]
    showAbout: []
}>()

const username = ref('')

const handleAnalysis = () => {
    if (props.isLoading) return

    if (!username.value.trim()) {
        emit('showError', '请输入有效的 GitHub 用户名')
        return
    }

    emit('startAnalysis', username.value.trim())
}
</script>
