import '@testing-library/jest-dom';

// Mock Electron APIs for testing
global.window = global.window || {};
global.window.electronAPI = {
  db: {
    initialize: vi.fn().mockResolvedValue({ success: true }),
    getSettings: vi.fn().mockResolvedValue({
      id: 'test',
      brandVoice: {
        tone: 'professional',
        style: 'conversational',
        vocabulary: ['test'],
        emojiUsage: 'minimal',
        callToAction: 'soft'
      },
      socialMedia: {
        facebook: { connected: false, accessToken: null },
        instagram: { connected: false, accessToken: null },
        linkedin: { connected: false, accessToken: null }
      },
      postingSchedule: {
        facebook: { times: ['09:00'], days: ['monday'] },
        instagram: { times: ['10:00'], days: ['tuesday'] },
        linkedin: { times: ['08:00'], days: ['wednesday'] }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    updateSettings: vi.fn().mockResolvedValue({ success: true })
  },
  media: {
    upload: vi.fn().mockResolvedValue({ success: true, fileId: 'test-file' }),
    getFiles: vi.fn().mockResolvedValue([]),
    deleteFile: vi.fn().mockResolvedValue({ success: true })
  },
  ollama: {
    checkStatus: vi.fn().mockResolvedValue({ status: 'Not Running', message: 'Ollama not installed' }),
    getModels: vi.fn().mockResolvedValue([]),
    pullModel: vi.fn().mockResolvedValue({ success: false, message: 'Ollama not available' }),
    generate: vi.fn().mockResolvedValue({ success: false, message: 'Ollama not available' })
  },
  dialog: {
    openFile: vi.fn().mockResolvedValue('/path/to/test/file')
  }
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}; 