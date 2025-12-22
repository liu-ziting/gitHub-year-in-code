// 使用 Cloudflare Workers 代理
const WORKERS_URL = 'https://github-api-ai.lz-t.top/'

export interface AIInputData {
    login: string
    stars: number
    lang: string
    topRepo: string
    totalContributions?: number
    longestStreak?: number
    mostActiveMonth?: string
    mostActiveDay?: string
    publicRepos?: number
    followers?: number
    topLangs?: string[]
}

export type AIType = 'analysis' | 'critique' | 'tags'

/**
 * 根据类型生成 AI 提示词 (Prompt)
 */
const getPrompt = (type: AIType, data: AIInputData): string => {
    if (type === 'analysis') {
        return `你是 GitHub 数据深度分析师。基于以下 2025 年的 GitHub 统计数据，为用户生成一份充满文学感、洞察力且富有情感的年度技术总结报告。

数据：
- 用户名：${data.login}
- 2025 年总贡献：${data.totalContributions || '未知'}
- 最长连续贡献：${data.longestStreak || '未知'} 天
- 最活跃月份：${data.mostActiveMonth || '未知'}
- 最活跃的一天：${data.mostActiveDay || '未知'}
- 主要语言：${data.lang} (及其它：${(data.topLangs || []).join(', ')})
- 旗舰项目：${data.topRepo}
- 公开仓库数：${data.publicRepos || '未知'}
- 总 Star 数：${data.stars}
- 关注者：${data.followers || '未知'}

要求：
1. **文风：** 避免陈词滥调。使用优雅、感性且富有节奏感的语言。像是在给一位老友写一封信，或者在评价一场精彩的演出。
2. **深度：** 不要只是罗列数据，要从数据中解读出用户的开发节奏、性格特点、技术追求和创作偏好。
3. **结构：**
   - 开篇：以贡献数切入，描述其开发的“节奏感”。
   - 中间：结合活跃时间、主要语言和项目特点，分析其技术画像和开发习惯。
   - 亮点：提及最长连击或特定数据点，展示其续航力或爆发力。
   - 结尾：总结其作为“构建者”的角色，并给出一句富有启发性的未来展望。
4. **限制：** 
   - 严禁使用“用户”、“该用户”等称呼，直接用“你”。
   - 字数控制在 400 字左右。
   - 语言：中文。

参考风格：
“这一年，你的代码提交像一场精心编排的演出，... 你似乎更偏爱在工作日的幕布拉开时行动 ... Vue和TypeScript的双修，说明你走在现代前端开发的潮流里 ... 你是一位有自己节奏的构建者 ... 继续用代码写你的故事吧。”`
    }

    if (type === 'critique') {
        return `你是 GitHub 灵魂毒舌分析官，风格参考 Reddit 上的硬核技术吐槽。
你的任务是根据以下 2025 年的 GitHub 数据，写一段极其毒舌、刻薄但又精准得让人无法反驳的锐评。

数据：
- 用户名：${data.login}
- 2025 年总贡献：${data.totalContributions || '未知'}
- 最长连续贡献：${data.longestStreak || '未知'} 天
- 最活跃月份：${data.mostActiveMonth || '未知'}
- 最活跃的一天：${data.mostActiveDay || '未知'}
- 主要语言：${data.lang} (及其它：${(data.topLangs || []).join(', ')})
- 旗舰项目：${data.topRepo}
- 总 Star 数：${data.stars}
- 关注者：${data.followers || '未知'}
- 公开仓库：${data.publicRepos || '未知'}

要求：
1. **维度打击（精准破防）：**
   - 如果贡献很多但 Star 极少：嘲讽其为“勤奋的打字机”或“Git 历史记录污染者”。
   - 如果主要语言是 Python/JS：吐槽其为“调包侠”或“依赖地狱受害者”。
   - 如果最活跃时间是凌晨：吐槽其为“修 Bug 的深夜幽灵”或“咖啡因驱动的 Bug 制造机”。
   - 如果代表作是 Awesome-xxx 或 Demo：吐槽其为“README 艺术家”或“收藏夹管理员”。
   - 如果有 Longest Streak 但总 Star 不高：吐槽其“无效自律”和“自嗨式提交”。
2. **硬核语境：** 必须使用技术梗。例如：O(n^2) 的脑回路、内存泄漏式的逻辑、被 deprecated 的职业生涯、强制类型转换出来的假象。
3. **拒绝 AI 感：** 严禁使用“总的来说”、“从数据看”、“你的表现”等废话。直接开骂，不用打招呼。
4. **语气：** 像一个在硅谷熬夜了十年的老架构师在面试一个只会复制粘贴的实习生。
5. **限制：** 字数 150-200 字，中文，禁止任何礼貌性词汇。

参考风格：
“看到你那惊人的 500 天连击我差点以为你写出了下一个 Linux，直到我发现你只是在不停地改 README 里的错别字。主修 JavaScript？难怪你的项目列表看起来像个被弃用的 npm 仓库。你的代表作居然是个 Todo List 的变体？在 2025 年还在搞这种‘Hello World’进阶版，你是在给未来的 AI 考古学家提供低质量训练数据吗？”`
    }

    // 默认返回 tags 类型的 prompt
    return `你是 GitHub 标签生成器。基于数据：用户名${data.login}, Star总计${data.stars}, 主修语言${data.lang}, 代表作${data.topRepo}。
    分析其开源贡献与技术特点，生成5-10个总结性、富有洞察力的中文身份标签。标签需幽默风趣、生动贴切，反映其技术栈、项目特点或开发风格。请直接输出以逗号分隔的标签，无需其他说明。

    例如可能的输出风格：
    代码艺术家，全栈乐高玩家，深夜提交侠，Python魔术师，开源传教士，Bug狩猎者；
    限制：
    用逗号分隔，不能重复。
    回复内容直接展示标签，不需要标题。`
}

/**
 * 调用 Mimo AI 接口获取分析内容
 */
export const callMimoAI = async (type: AIType, data: AIInputData): Promise<string> => {
    const prompt = getPrompt(type, data)

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
        return type === 'tags' ? '技术宅,代码人,探索者' : 'AI 脑机连接异常，但在代码维度里，你已经是不可忽视的奇点。'
    }
}
