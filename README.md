# IMM Marketing Hub - Complete Social Media Management Platform

A comprehensive Electron-based desktop application for managing social media marketing campaigns, content creation, scheduling, and analytics across multiple platforms.

## 🚀 Features

### ✅ Implemented Milestones

1. **Project Bootstrap** - Complete Electron + React + TypeScript setup
2. **Local File & Media Library** - File upload, variant generation, metadata extraction
3. **Brand Voice Core** - AI-powered brand voice training and content generation
4. **Content Studio** - Multi-platform content creation with preview
5. **Calendar & Scheduling** - Visual calendar, smart scheduler, conflict detection
6. **Social Posting Connectors** - Facebook, Instagram, LinkedIn integration
7. **Engagement Hub** - Social media interaction management
8. **Analytics** - Performance metrics and reporting
9. **Product Library & AI Image** - Product management with AI image generation

### 🎯 Key Capabilities

- **Multi-Platform Support**: Facebook, Instagram, LinkedIn
- **AI Integration**: Ollama-powered content generation and brand voice training
- **Media Management**: Upload, organize, and generate variants
- **Smart Scheduling**: Automated posting with conflict detection
- **Analytics Dashboard**: Real-time performance tracking
- **Product Library**: AI-powered product image generation
- **Modern UI**: Responsive design with accessibility features

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Electron + Node.js
- **Database**: SQLite with better-sqlite3
- **AI**: Ollama integration for local AI models
- **Media Processing**: Sharp + FFmpeg
- **Styling**: Modern CSS with design system
- **Build Tool**: Electron Builder

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Ollama (for AI features)
- FFmpeg (for media processing)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/prisken/IMM-Social-Media-Hub-Basic.git
   cd IMM-Social-Media-Hub-Basic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Ollama** (for AI features)
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

4. **Start Ollama server**
   ```bash
   ollama serve
   ```

5. **Install AI models** (optional)
   ```bash
   ollama pull llama2
   ollama pull mistral
   ```

6. **Run the application**
   ```bash
   npm run dev
   ```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Project Structure

```
src/
├── main/           # Electron main process
│   ├── index.ts    # Main entry point
│   ├── database.ts # Database management
│   ├── ollama-manager.ts # AI integration
│   ├── social-connectors.ts # Social media APIs
│   └── ...
├── renderer/       # React frontend
│   ├── App.tsx     # Main app component
│   ├── components/ # React components
│   └── ...
└── shared/         # Shared types and utilities
```

## 🎨 UI/UX Features

### Modern Design System
- **Consistent Color Palette**: Primary blue (#2563eb), accent orange (#f59e0b)
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent spacing scale (4px base unit)
- **Shadows**: Layered shadow system for depth
- **Animations**: Smooth transitions and micro-interactions

### Accessibility
- **High Contrast**: Proper text visibility on all backgrounds
- **Focus States**: Clear focus indicators
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML structure

### Responsive Design
- **Mobile-First**: Responsive layouts for all screen sizes
- **Touch-Friendly**: Optimized for touch interactions
- **Adaptive Components**: Components that adapt to screen size

## 🔌 Social Media Integration

### Supported Platforms

#### Facebook
- ✅ Page posting
- ✅ Image and video uploads
- ✅ Scheduled posts
- ✅ Analytics integration

#### Instagram
- ✅ Business account posting
- ✅ Story creation
- ✅ Carousel posts
- ⚠️ Requires Business Account setup

#### LinkedIn
- ✅ Company page posting
- ✅ Article sharing
- ✅ Professional networking features

### Setup Instructions

1. **Facebook Setup**
   - Create Facebook Developer account
   - Set up Facebook App
   - Configure permissions (pages_manage_posts, pages_read_engagement)
   - Get access token and page ID

2. **Instagram Setup**
   - Convert to Business Account
   - Connect to Facebook Page
   - Configure Instagram Graph API permissions

3. **LinkedIn Setup**
   - Create LinkedIn Developer account
   - Set up LinkedIn App
   - Configure OAuth 2.0 permissions
   - Get access token

## 🤖 AI Features

### Brand Voice Training
- **Content Analysis**: Analyze existing content for brand voice
- **Voice Training**: Train AI models on your brand's style
- **Content Generation**: Generate brand-consistent content
- **Sample Creation**: Create sample posts and captions

### AI Image Generation
- **Product Images**: Generate product photos with AI
- **Marketing Assets**: Create promotional graphics
- **Style Consistency**: Maintain brand visual identity
- **Custom Prompts**: Advanced prompt engineering

### Supported Models
- **Llama 2**: General purpose content generation
- **Mistral**: Fast and efficient text generation
- **Custom Models**: Support for custom fine-tuned models

## 📊 Analytics & Reporting

### Metrics Tracked
- **Engagement Rate**: Likes, comments, shares
- **Reach**: Post impressions and reach
- **Click-through Rate**: Link clicks and conversions
- **Best Times**: Optimal posting schedule analysis
- **Top Content**: Performance ranking of posts

### Dashboard Features
- **Real-time Updates**: Live data from social platforms
- **Visual Charts**: Interactive charts and graphs
- **Export Options**: CSV/PDF report generation
- **Custom Date Ranges**: Flexible time period selection

## 🗄️ Database Schema

### Core Tables
- `social_media_accounts`: Platform connections
- `posts`: Content and scheduling data
- `brand_voice_profiles`: AI training data
- `analytics_metrics`: Performance tracking
- `scheduled_jobs`: Post scheduling
- `engagement_interactions`: Social interactions
- `products`: Product library
- `media_files`: File management

## 🔒 Security & Privacy

### Data Protection
- **Local Storage**: All data stored locally
- **Encryption**: Sensitive data encryption
- **No Cloud Sync**: Complete privacy control
- **Token Security**: Secure token storage

### Social Media Security
- **OAuth 2.0**: Secure authentication
- **Token Refresh**: Automatic token renewal
- **Permission Scoping**: Minimal required permissions
- **Secure API Calls**: Encrypted API communication

## 🚀 Deployment

### Building for Production

```bash
# Build the application
npm run build

# Create distributable
npm run electron:build
```

### Supported Platforms
- **macOS**: .dmg installer
- **Windows**: .exe installer
- **Linux**: .AppImage and .deb packages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **Ollama Connection Error**
   - Ensure Ollama server is running: `ollama serve`
   - Check if models are installed: `ollama list`

2. **Social Media Authentication**
   - Verify access tokens are valid
   - Check platform permissions
   - Ensure accounts are properly connected

3. **Media Processing Errors**
   - Install FFmpeg: `brew install ffmpeg` (macOS)
   - Check file permissions
   - Verify supported file formats

### Getting Help

- **Documentation**: Check the guides in the `/docs` folder
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

## 🎯 Roadmap

### Upcoming Features
- [ ] TikTok integration
- [ ] YouTube Shorts support
- [ ] Advanced AI image editing
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Mobile companion app

### Performance Improvements
- [ ] Database optimization
- [ ] Caching system
- [ ] Background processing
- [ ] Memory usage optimization

---

**Built with ❤️ for modern social media marketing** 