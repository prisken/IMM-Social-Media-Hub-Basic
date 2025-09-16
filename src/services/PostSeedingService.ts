import { Post, SocialPlatform, PostType, PostStatus, Category, Topic } from '@/types'
import { databaseService } from './database/DatabaseService'
import { createMediaService } from './media/MediaService'
import { apiService } from './ApiService'

interface SeedPostsConfig {
  organizationId: string
  platforms: SocialPlatform[]
  postTypes: PostType[]
  statuses: PostStatus[]
  categoryIds: string[]
  topicIds: string[]
  count: number
  includeScheduled: boolean
  includePublished: boolean
  dateRange: {
    start: Date
    end: Date
  }
}

export class PostSeedingService {
  private organizationId: string
  private mediaService: ReturnType<typeof createMediaService>

  constructor(organizationId: string) {
    this.organizationId = organizationId
    this.mediaService = createMediaService(organizationId)
  }

  async seedPosts(config: SeedPostsConfig): Promise<Post[]> {
    const seededPosts: Post[] = []
    
    // Fetch actual categories and topics from the database
    const categories = await apiService.getCategories()
    const topics = await apiService.getTopics()

    const filteredCategories = categories.filter(cat => config.categoryIds.includes(cat.id))
    const filteredTopics = topics.filter(topic => config.topicIds.includes(topic.id))

    if (filteredCategories.length === 0 || filteredTopics.length === 0) {
      throw new Error('No categories or topics selected for seeding.')
    }

    for (let i = 0; i < config.count; i++) {
      const randomPlatform = config.platforms[Math.floor(Math.random() * config.platforms.length)]
      const randomPostType = config.postTypes[Math.floor(Math.random() * config.postTypes.length)]
      const randomStatus = config.statuses[Math.floor(Math.random() * config.statuses.length)]
      const randomCategory = filteredCategories[Math.floor(Math.random() * filteredCategories.length)]
      const randomTopic = filteredTopics.filter(t => t.categoryId === randomCategory.id)[0] || filteredTopics[0]

      const title = this.generateTitle(randomPlatform, randomPostType, randomCategory, randomTopic)
      const content = this.generateContent(randomPlatform, randomPostType, randomCategory, randomTopic)
      const hashtags = this.extractHashtags(content)

      let scheduledAt: string | undefined
      let publishedAt: string | undefined

      if (randomStatus === 'scheduled' && config.includeScheduled) {
        scheduledAt = this.generateRandomDate(config.dateRange.start, config.dateRange.end).toISOString()
      } else if (randomStatus === 'published' && config.includePublished) {
        publishedAt = this.generateRandomDate(config.dateRange.start, new Date()).toISOString()
        scheduledAt = publishedAt // Published posts were also scheduled
      }

      const newPost: Omit<Post, 'id' | 'createdAt' | 'updatedAt'> = {
        organizationId: this.organizationId,
        categoryId: randomCategory.id,
        topicId: randomTopic.id,
        title,
        content,
        media: [], // For now, no media seeding
        hashtags,
        platform: randomPlatform,
        type: randomPostType,
        status: randomStatus,
        scheduledAt,
        publishedAt,
        metadata: {
          characterCount: content.length,
          wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
          readingTime: Math.ceil(content.split(/\s+/).filter(word => word.length > 0).length / 200), // 200 words per minute
          lastEditedBy: 'seeder',
          version: 1
        }
      }

      const createdPost = await databaseService.createPost(newPost)
      seededPosts.push(createdPost)
    }
    return seededPosts
  }

  private generateTitle(platform: SocialPlatform, type: PostType, category: Category, topic: Topic): string {
    const titles = [
      `Exciting ${category.name} on ${platform}`,
      `New ${topic.name} Update for ${platform}`,
      `Check out our latest ${type} post!`,
      `A message from our ${category.name} team`,
      `Don't miss this ${topic.name} on ${platform}`
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  private generateContent(platform: SocialPlatform, type: PostType, category: Category, topic: Topic): string {
    const baseContent = `This is a sample post for ${platform} about ${category.name} focusing on ${topic.name}.`
    const typeContent = {
      text: `Here's some engaging text content. We're excited to share more! #${category.name.replace(/\s/g, '')} #${topic.name.replace(/\s/g, '')}`,
      image: `Check out this amazing image! Visual content performs great. #visuals #${platform}`,
      video: `Watch our new video! It's packed with insights. #video #content`,
      carousel: `Swipe through our carousel for more details. #carousel #storytelling`,
      story: `A quick story update for our followers. #story #quickupdate`
    }
    return `${baseContent} ${typeContent[type]}`
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g
    return content.match(hashtagRegex) || []
  }

  private generateRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }
}

export function createPostSeedingService(organizationId: string): PostSeedingService {
  return new PostSeedingService(organizationId)
}
