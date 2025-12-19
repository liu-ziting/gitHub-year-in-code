<template>
  <div v-html="renderedText" class="markdown-content"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
}>()

// 简单的Markdown渲染函数
const renderedText = computed(() => {
  if (!props.text) return ''
  
  let html = props.text
  
  // 处理加粗 **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
  
  // 处理换行
  html = html.replace(/\n/g, '<br>')
  
  return html
})
</script>

<style scoped>
.markdown-content :deep(strong) {
  @apply text-white font-bold;
}
</style>