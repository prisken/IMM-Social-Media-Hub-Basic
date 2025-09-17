# Social Media Management App

A comprehensive desktop application for organizing, creating, and scheduling social media content with a beautiful dual-pane interface.

## Features

### 🎯 Core Features
- **Dual-Pane Interface**: 40% preview window, 60% working area
- **Post Management**: Create, edit, and organize social media posts
- **Calendar Scheduling**: Drag-and-drop scheduling with multiple views
- **Media Management**: Upload, organize, and optimize media files
- **Category System**: Hierarchical organization with color coding
- **Multi-Platform Support**: Instagram, Facebook, Twitter, LinkedIn

### 🚀 Advanced Features
- **AI Assistant**: Local AI-powered content creation and scheduling
- **Real-time Preview**: Live preview of posts as you edit
- **Bulk Operations**: Multi-select and batch actions
- **Search & Filtering**: Advanced search with multiple filters
- **Media Optimization**: Automatic image compression and thumbnails
- **Local Storage**: All data stored locally for privacy
- **Multi-tenant**: Support for multiple organizations

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: SQLite
- **State Management**: React Query
- **AI**: Ollama (Local LLM)
- **Forms**: React Hook Form
- **Drag & Drop**: React DnD

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd social-media-management
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Calendar/       # Calendar and scheduling
│   ├── Layout/         # Layout components
│   ├── PostEditor/     # Post creation and editing
│   ├── Preview/        # Preview window components
│   ├── MediaUpload/    # Media upload functionality
│   └── CategoryManager/ # Category and topic management
├── services/           # Business logic services
│   ├── database/       # Database operations
│   ├── storage/        # File storage management
│   └── media/          # Media processing
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## Development Phases

### Phase 1: Core Foundation ✅
- [x] Project setup and architecture
- [x] Authentication system
- [x] Basic UI layout
- [x] Database schema design
- [x] File system organization

### Phase 2: Post Management (In Progress)
- [ ] Post creation workflow
- [ ] Category and topic management
- [ ] Post editing interface
- [ ] Media upload system
- [ ] Preview window implementation

### Phase 3: Calendar System
- [ ] Calendar interface
- [ ] Drag-and-drop scheduling
- [ ] Post list management
- [ ] Time management features
- [ ] Calendar views

### Phase 4: Advanced Features
- [ ] Media enhancements
- [ ] Post templates
- [ ] Bulk operations
- [ ] Search and filtering
- [ ] Performance optimization

### Phase 5: Polish & Testing
- [ ] UI/UX refinements
- [ ] Bug fixes
- [ ] Performance testing
- [ ] User testing
- [ ] Documentation

## Usage

### Creating an Organization
1. Launch the application
2. Click "Create Organization"
3. Fill in organization details
4. Create your admin account

### Managing Posts
1. Navigate to the Posts tab
2. Click "New Post" to create content
3. Select category and topic
4. Add media and content
5. Preview in real-time
6. Save as draft or schedule

### Calendar Management
1. Switch to Calendar view
2. Drag posts from the list to schedule
3. Use different view modes (month/week/day)
4. Manage scheduled content

### Media Organization
1. Upload files via drag-and-drop
2. Organize by categories and topics
3. Use color coding for visual organization
4. Search and filter content

## AI Assistant

The app includes a powerful AI assistant that can create and schedule social media posts using natural language commands. The AI runs completely locally on your machine using Ollama, ensuring your data stays private.

### Features
- **Conversational Interface**: Chat with the AI using natural language
- **Smart Content Generation**: Creates platform-optimized posts
- **Intelligent Scheduling**: Suggests optimal posting times
- **Brand Consistency**: Maintains your brand voice across all content
- **Double Confirmation**: Review and edit before creating posts

### Quick Start
1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Download a model: `ollama pull llama3:8b`
3. Start Ollama: `ollama serve`
4. Click the AI Assistant button (sparkles icon) in the app header

### Example Commands
```
"Create 5 Instagram posts for my fitness brand next week"
"Generate LinkedIn content about AI trends"
"Make a 2-week Facebook calendar for my restaurant"
```

For detailed setup instructions, see [AI_SETUP_GUIDE.md](./AI_SETUP_GUIDE.md).

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
NODE_ENV=development
VITE_APP_NAME=Social Media Manager
```

### Database Configuration
The app uses SQLite for local storage. Database files are automatically created in the user's data directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

- [x] AI-powered content creation and scheduling
- [ ] Cloud sync capabilities
- [ ] Team collaboration features
- [ ] Advanced analytics
- [ ] API integrations
- [ ] Mobile companion app
- [ ] Enhanced AI features (image generation, trend analysis)
