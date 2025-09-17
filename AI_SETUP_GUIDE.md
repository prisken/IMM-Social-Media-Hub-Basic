# AI Assistant Setup Guide

## Overview
The AI Assistant feature allows you to create and schedule social media posts using natural language commands. It runs completely locally on your machine using Ollama, ensuring your data stays private.

## Prerequisites
- macOS, Windows, or Linux
- At least 8GB RAM (16GB recommended)
- 10GB free disk space

## Installation Steps

### 1. Install Ollama
Visit [https://ollama.ai](https://ollama.ai) and download Ollama for your operating system.

**macOS:**
```bash
# Download and install from the website, or use Homebrew:
brew install ollama
```

**Windows:**
- Download the installer from the website
- Run the installer and follow the setup wizard

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama Service
After installation, start the Ollama service:

**macOS/Linux:**
```bash
ollama serve
```

**Windows:**
- Ollama should start automatically as a service
- You can also start it manually from the Start menu

### 3. Download AI Model
Download the recommended model (this may take a few minutes):

```bash
ollama pull llama3:8b
```

Alternative models you can try:
```bash
# Smaller, faster model (4GB RAM)
ollama pull llama3.2:3b

# Larger, more capable model (16GB+ RAM)
ollama pull llama3:70b

# Specialized for coding
ollama pull codellama:7b
```

### 4. Verify Installation
Test that Ollama is working:

```bash
ollama list
```

You should see your downloaded model(s) listed.

### 5. Test the AI Assistant
1. Open your Social Media Management app
2. Click the AI Assistant button (sparkles icon) in the header
3. You should see a green connection indicator
4. Try asking: "Create 3 Instagram posts for my fitness brand"

## Usage Examples

### Basic Content Creation
```
"Create 5 Instagram posts for my restaurant next week"
"Generate LinkedIn content about AI trends"
"Make Facebook posts for Black Friday promotion"
```

### Detailed Requests
```
"Create a 2-week Instagram calendar for my tech startup. 
I want 3 posts per week about product updates, 
industry insights, and company culture. 
Schedule them for optimal engagement times."
```

### Platform-Specific Content
```
"Create TikTok videos for my fitness brand. 
Include workout tips, nutrition advice, and motivation. 
Post daily at 7 PM with trending sounds."
```

## Troubleshooting

### Connection Issues
- **"AI service not available"**: Make sure Ollama is running (`ollama serve`)
- **"Connection failed"**: Check if Ollama is accessible at `http://localhost:11434`

### Performance Issues
- **Slow responses**: Try a smaller model like `llama3.2:3b`
- **Out of memory**: Close other applications or use a smaller model
- **Model not found**: Run `ollama pull llama3:8b` to download the model

### Model Management
```bash
# List installed models
ollama list

# Remove a model to free space
ollama rm llama3.1:70b

# Update a model
ollama pull llama3.1:8b
```

## Features

### Conversational Interface
- Natural language input
- Clarifying questions when needed
- Context-aware responses

### Content Generation
- Platform-optimized content
- Brand voice consistency
- Hashtag suggestions
- Call-to-action recommendations

### Smart Scheduling
- Optimal posting times
- Calendar integration
- Batch post creation

### Privacy & Security
- All processing happens locally
- No data sent to external servers
- Your content stays on your machine

## Advanced Configuration

### Custom Models
You can use different models by changing the model in the AI Assistant settings:

1. Open AI Assistant
2. Click the settings icon
3. Select your preferred model from the dropdown

### Model Recommendations
- **llama3.2:3b**: Fast, good for basic content (4GB RAM)
- **llama3:8b**: Balanced performance and quality (8GB RAM)
- **llama3:70b**: Best quality, requires powerful hardware (40GB+ RAM)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure Ollama is running: `ollama serve`
3. Verify model is installed: `ollama list`
4. Test with a simple request first

For more help, visit the [Ollama documentation](https://ollama.ai/docs) or check the app's console for error messages.
