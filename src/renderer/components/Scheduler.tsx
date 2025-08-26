import React, { useState, useEffect } from 'react';
import { format, parseISO, isAfter, isBefore, addMinutes } from 'date-fns';
import PostEditor from './PostEditor';
import './Scheduler.css';

interface ScheduledJob {
  id: string;
  postId: string;
  platform: string;
  content: string;
  mediaFiles: string[];
  scheduledTime: string;
  status: 'queued' | 'scheduled' | 'running' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

interface SchedulerProps {
  onJobStatusChange?: (jobId: string, status: string) => void;
  onJobComplete?: (jobId: string, result: any) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ 
  onJobStatusChange, 
  onJobComplete 
}) => {
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [schedulerStatus, setSchedulerStatus] = useState<'running' | 'stopped'>('running');
  const [nextJobTime, setNextJobTime] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showPostEditor, setShowPostEditor] = useState(false);

  useEffect(() => {
    loadScheduledJobs();
    startScheduler();
    setupOnlineStatusListener();

    return () => {
      stopScheduler();
    };
  }, []);

  useEffect(() => {
    if (isOnline && schedulerStatus === 'running') {
      processQueuedJobs();
    }
  }, [isOnline, scheduledJobs]);

  const setupOnlineStatusListener = () => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const loadScheduledJobs = async () => {
    try {
      const response = await window.electronAPI.scheduler.getJobs();
      setScheduledJobs(response || []);
    } catch (error) {
      console.error('Failed to load scheduled jobs:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const startScheduler = () => {
    setSchedulerStatus('running');
    // Start the scheduler interval
    const interval = setInterval(() => {
      if (schedulerStatus === 'running') {
        checkAndExecuteJobs();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  };

  const stopScheduler = () => {
    setSchedulerStatus('stopped');
  };

  const checkAndExecuteJobs = async () => {
    const now = new Date();
    const jobsToExecute = scheduledJobs.filter(job => {
      const scheduledTime = parseISO(job.scheduledTime);
      return job.status === 'scheduled' && 
             isBefore(scheduledTime, now) && 
             job.retryCount < job.maxRetries;
    });

    for (const job of jobsToExecute) {
      await executeJob(job);
    }

    // Update next job time
    const nextJob = scheduledJobs
      .filter(job => job.status === 'scheduled')
      .sort((a, b) => parseISO(a.scheduledTime).getTime() - parseISO(b.scheduledTime).getTime())[0];

    if (nextJob) {
      setNextJobTime(parseISO(nextJob.scheduledTime));
    }
  };

  const executeJob = async (job: ScheduledJob) => {
    try {
      // Update job status to running
      await updateJobStatus(job.id, 'running');
      onJobStatusChange?.(job.id, 'running');

      // Simulate posting to social media
      const result = await postToSocialMedia(job);
      
      if (result.success) {
        await updateJobStatus(job.id, 'completed');
        onJobComplete?.(job.id, result);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      
      const newRetryCount = job.retryCount + 1;
      if (newRetryCount >= job.maxRetries) {
        await updateJobStatus(job.id, 'failed', error.message);
      } else {
        // Reschedule for retry
        const retryTime = addMinutes(new Date(), 5 * newRetryCount); // Exponential backoff
        await rescheduleJob(job.id, retryTime.toISOString(), newRetryCount);
      }
    }
  };

  const postToSocialMedia = async (job: ScheduledJob): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call to social media platform
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        if (success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'API rate limit exceeded' });
        }
      }, 2000);
    });
  };

  const updateJobStatus = async (jobId: string, status: string, errorMessage?: string) => {
    try {
      await window.electronAPI.scheduler.updateJob(jobId, { status, errorMessage });
      await loadScheduledJobs();
          } catch (error) {
        console.error('Failed to update job status:', error instanceof Error ? error.message : 'Unknown error');
      }
  };

  const rescheduleJob = async (jobId: string, newTime: string, retryCount: number) => {
    try {
      await window.electronAPI.scheduler.updateJob(jobId, { 
        scheduledTime: newTime, 
        retryCount,
        status: 'scheduled'
      });
      await loadScheduledJobs();
    } catch (error) {
      console.error('Failed to reschedule job:', error);
    }
  };

  const processQueuedJobs = async () => {
    const queuedJobs = scheduledJobs.filter(job => job.status === 'queued');
    
    for (const job of queuedJobs) {
      await updateJobStatus(job.id, 'scheduled');
    }
  };

  const addJobToQueue = async (postId: string, platform: string, content: string, mediaFiles: string[], scheduledTime: string) => {
    const newJob: Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt'> = {
      postId,
      platform,
      content,
      mediaFiles,
      scheduledTime,
      status: 'queued',
      retryCount: 0,
      maxRetries: 3
    };

    try {
      await window.electronAPI.scheduler.addJob(newJob);
      await loadScheduledJobs();
    } catch (error) {
      console.error('Failed to add job to queue:', error);
    }
  };

  const removeJobFromQueue = async (jobId: string) => {
    try {
      await window.electronAPI.scheduler.deleteJob(jobId);
      await loadScheduledJobs();
    } catch (error) {
      console.error('Failed to remove job from queue:', error);
    }
  };

  const handleEditPost = (job: ScheduledJob) => {
    // Convert job to post format for editing
    const post = {
      id: job.postId,
      platform: job.platform,
      content: job.content,
      mediaFiles: job.mediaFiles,
      scheduledTime: job.scheduledTime,
      status: job.status as any,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
    setEditingPost(post);
    setShowPostEditor(true);
  };

  const handlePostSave = (updatedPost: any) => {
    // Update the job with the edited post data
    const updatedJob = {
      ...scheduledJobs.find(j => j.postId === updatedPost.id),
      platform: updatedPost.platform,
      content: updatedPost.content,
      scheduledTime: updatedPost.scheduledTime
    };
    
    if (updatedJob) {
      updateJobStatus(updatedJob.id, updatedJob.status, updatedJob);
    }
    
    setEditingPost(null);
    setShowPostEditor(false);
  };

  const handlePostEditorClose = () => {
    setEditingPost(null);
    setShowPostEditor(false);
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return '#f59e0b';
      case 'scheduled': return '#3b82f6';
      case 'running': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return '⏳';
      case 'scheduled': return '📅';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="scheduler-container">
      <div className="scheduler-header">
        <h2>Scheduler</h2>
        <div className="scheduler-status">
          <div className={`status-indicator ${schedulerStatus}`}>
            {schedulerStatus === 'running' ? '🟢' : '🔴'} {schedulerStatus}
          </div>
          <div className="online-status">
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </div>
          {nextJobTime && (
            <div className="next-job">
              Next: {format(nextJobTime, 'MMM dd, HH:mm')}
            </div>
          )}
        </div>
        <div className="scheduler-controls">
          <button 
            className={schedulerStatus === 'running' ? 'active' : ''}
            onClick={() => setSchedulerStatus('running')}
          >
            Start
          </button>
          <button 
            className={schedulerStatus === 'stopped' ? 'active' : ''}
            onClick={() => setSchedulerStatus('stopped')}
          >
            Stop
          </button>
        </div>
      </div>

      <div className="scheduler-stats">
        <div className="stat-item">
          <span className="stat-number">{scheduledJobs.filter(j => j.status === 'queued').length}</span>
          <span className="stat-label">Queued</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{scheduledJobs.filter(j => j.status === 'scheduled').length}</span>
          <span className="stat-label">Scheduled</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{scheduledJobs.filter(j => j.status === 'running').length}</span>
          <span className="stat-label">Running</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{scheduledJobs.filter(j => j.status === 'completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{scheduledJobs.filter(j => j.status === 'failed').length}</span>
          <span className="stat-label">Failed</span>
        </div>
      </div>

      <div className="jobs-list">
        <h3>Job Queue</h3>
        {scheduledJobs.length === 0 ? (
          <div className="empty-state">
            <p>No scheduled jobs</p>
          </div>
        ) : (
          <div className="jobs-container">
            {scheduledJobs.map(job => (
              <div key={job.id} className="job-item">
                <div className="job-header">
                  <div className="job-status">
                    <span className="status-icon">{getJobStatusIcon(job.status)}</span>
                    <span className="status-text">{job.status}</span>
                  </div>
                  <div className="job-platform">{job.platform}</div>
                  <div className="job-time">
                    {format(parseISO(job.scheduledTime), 'MMM dd, HH:mm')}
                  </div>
                </div>
                <div className="job-content">
                  <p>{job.content.substring(0, 100)}...</p>
                  {job.mediaFiles.length > 0 && (
                    <div className="job-media">
                      📎 {job.mediaFiles.length} media file(s)
                    </div>
                  )}
                </div>
                {job.status === 'failed' && job.errorMessage && (
                  <div className="job-error">
                    Error: {job.errorMessage}
                  </div>
                )}
                {job.retryCount > 0 && (
                  <div className="job-retries">
                    Retries: {job.retryCount}/{job.maxRetries}
                  </div>
                )}
                <div className="job-actions">
                  <button 
                    className="action-button edit"
                    onClick={() => handleEditPost(job)}
                  >
                    Edit
                  </button>
                  {job.status === 'queued' && (
                    <button 
                      className="action-button remove"
                      onClick={() => removeJobFromQueue(job.id)}
                    >
                      Remove
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <button 
                      className="action-button retry"
                      onClick={() => updateJobStatus(job.id, 'scheduled')}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <PostEditor
        post={editingPost}
        isOpen={showPostEditor}
        onClose={handlePostEditorClose}
        onSave={handlePostSave}
      />
    </div>
  );
};

export default Scheduler; 