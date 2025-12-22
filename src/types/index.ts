export interface GitHubUser {
    login: string
    name: string | null
    avatar_url: string
    bio: string | null
    public_repos: number
    followers: number
    following: number
    created_at: string
}

export interface GitHubRepo {
    name: string
    language: string | null
    stargazers_count: number
    forks_count: number
    created_at: string
    updated_at: string
    fork: boolean
}

export interface UserData extends GitHubUser {
    totalStars: number
    topLang: string
    rank: string
    techImpact: string
    powerLevel: string
    totalContributions: number
    totalCommits: number
    longestStreak: number
    mostActiveMonth: string
    mostActiveDay: string
    reportId: number
    heatmapUrl: string
    starRepoName?: string
    starRepoStars?: number
    highCommitRepoName?: string
    highCommitRepoCount?: number
    highContributorRepoName?: string
    highContributorRepoCount?: number
    languageStats?: { label: string; count: number }[]
    starDistribution?: { label: string; count: number }[]
}

export interface AIResponse {
    choices: Array<{
        message: {
            content: string
        }
    }>
}
