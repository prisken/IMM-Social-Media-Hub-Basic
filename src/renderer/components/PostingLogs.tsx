import React, { useState, useEffect } from 'react';
import './PostingLogs.css';

interface PostingLog {
  id: string;
  jobId: string;
  platform: string;
  accountId: string;
  content: string;
  mediaFiles: string[];
  status: 'pending' | 'posting' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  result?: any;
  scheduledTime: string;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostingJob {
  id: string;
  postId: string;
  platform: string;
  accountId: string;
  content: string;
  mediaFiles: string[];
  scheduledTime: string;
  status: 'pending' | 'posting' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  result?: any;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const PostingLogs: React.FC = () => {
  const [logs, setLogs] = useState<PostingLog[]>([]);
  const [jobs, setJobs] = useState<PostingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'logs' | 'jobs'>('logs');
  const [selectedJob, setSelectedJob] = useState<PostingJob | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, jobsData] = await Promise.all([
        window.electronAPI.posting.getLogs(100, 0),
        window.electronAPI.posting.getJobs(100, 0)
      ]);
      setLogs(logsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading posting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await window.electronAPI.posting.retryJob(jobId);
      await loadData();
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to cancel this job?')) {
      try {
        await window.electronAPI.posting.cancelJob(jobId);
        await loadData();
      } catch (error) {
        console.error('Error cancelling job:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'posting':
        return '⏳';
      case 'pending':
        return '⏰';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#27ae60';
      case 'failed':
        return '#e74c3c';
      case 'posting':
        return '#f39c12';
      case 'pending':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'linkedin':
        return '💼';
      default:
        return '🌐';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  if (loading) {
    return <div className="posting-logs-loading">Loading posting data...</div>;
  }

  return (
    <div className="posting-logs">
      <div className="posting-logs-header">
        <h2>Posting Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={loadData}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${selectedTab === 'logs' ? 'active' : ''}`}
          onClick={() => setSelectedTab('logs')}
        >
          Posting Logs ({logs.length})
        </button>
        <button
          className={`tab ${selectedTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setSelectedTab('jobs')}
        >
          Active Jobs ({jobs.filter(j => j.status === 'pending' || j.status === 'posting').length})
        </button>
      </div>

      <div className="filter-bar">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="posting">Posting</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {selectedTab === 'logs' && (
        <div className="logs-list">
          {filteredLogs.length === 0 ? (
            <div className="no-data">
              <p>No posting logs found.</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="log-card">
                <div className="log-header">
                  <div className="log-info">
                    <span className="status-icon" style={{ color: getStatusColor(log.status) }}>
                      {getStatusIcon(log.status)}
                    </span>
                    <div className="log-details">
                      <h4>{getPlatformIcon(log.platform)} {log.platform.toUpperCase()}</h4>
                      <p className="log-time">
                        {log.postedAt ? `Posted: ${formatDate(log.postedAt)}` : `Scheduled: ${formatDate(log.scheduledTime)}`}
                      </p>
                    </div>
                  </div>
                  <div className="log-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(log.status) }}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>

                <div className="log-content">
                  <p>{truncateContent(log.content)}</p>
                  {log.mediaFiles.length > 0 && (
                    <p className="media-info">
                      📎 {log.mediaFiles.length} media file(s)
                    </p>
                  )}
                </div>

                {log.lastError && (
                  <div className="error-info">
                    <p className="error-message">Error: {log.lastError}</p>
                  </div>
                )}

                <div className="log-meta">
                  <span>Retries: {log.retryCount}/{log.maxRetries}</span>
                  <span>Created: {formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedTab === 'jobs' && (
        <div className="jobs-list">
          {filteredJobs.length === 0 ? (
            <div className="no-data">
              <p>No active jobs found.</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-info">
                    <span className="status-icon" style={{ color: getStatusColor(job.status) }}>
                      {getStatusIcon(job.status)}
                    </span>
                    <div className="job-details">
                      <h4>{getPlatformIcon(job.platform)} {job.platform.toUpperCase()}</h4>
                      <p className="job-time">
                        Scheduled: {formatDate(job.scheduledTime)}
                      </p>
                    </div>
                  </div>
                  <div className="job-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(job.status) }}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>

                <div className="job-content">
                  <p>{truncateContent(job.content)}</p>
                  {job.mediaFiles.length > 0 && (
                    <p className="media-info">
                      📎 {job.mediaFiles.length} media file(s)
                    </p>
                  )}
                </div>

                {job.lastError && (
                  <div className="error-info">
                    <p className="error-message">Error: {job.lastError}</p>
                  </div>
                )}

                <div className="job-actions">
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                  >
                    View Details
                  </button>
                  
                  {job.status === 'failed' && (
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => handleRetryJob(job.id)}
                    >
                      Retry
                    </button>
                  )}
                  
                  {(job.status === 'pending' || job.status === 'posting') && (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleCancelJob(job.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="job-meta">
                  <span>Retries: {job.retryCount}/{job.maxRetries}</span>
                  <span>Created: {formatDate(job.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showJobDetails && selectedJob && (
        <div className="job-details-overlay">
          <div className="job-details-modal">
            <div className="modal-header">
              <h3>Job Details</h3>
              <button 
                className="close-btn"
                onClick={() => setShowJobDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="detail-group">
                <label>Platform:</label>
                <span>{getPlatformIcon(selectedJob.platform)} {selectedJob.platform.toUpperCase()}</span>
              </div>
              
              <div className="detail-group">
                <label>Status:</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedJob.status) }}
                >
                  {selectedJob.status}
                </span>
              </div>
              
              <div className="detail-group">
                <label>Scheduled Time:</label>
                <span>{formatDate(selectedJob.scheduledTime)}</span>
              </div>
              
              {selectedJob.postedAt && (
                <div className="detail-group">
                  <label>Posted At:</label>
                  <span>{formatDate(selectedJob.postedAt)}</span>
                </div>
              )}
              
              <div className="detail-group">
                <label>Retry Count:</label>
                <span>{selectedJob.retryCount}/{selectedJob.maxRetries}</span>
              </div>
              
              <div className="detail-group">
                <label>Content:</label>
                <div className="content-display">
                  {selectedJob.content}
                </div>
              </div>
              
              {selectedJob.mediaFiles.length > 0 && (
                <div className="detail-group">
                  <label>Media Files:</label>
                  <div className="media-files">
                    {selectedJob.mediaFiles.map((file, index) => (
                      <div key={index} className="media-file">
                        📎 {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedJob.lastError && (
                <div className="detail-group">
                  <label>Error:</label>
                  <div className="error-display">
                    {selectedJob.lastError}
                  </div>
                </div>
              )}
              
              {selectedJob.result && (
                <div className="detail-group">
                  <label>Result:</label>
                  <div className="result-display">
                    <pre>{JSON.stringify(selectedJob.result, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              {selectedJob.status === 'failed' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleRetryJob(selectedJob.id);
                    setShowJobDetails(false);
                  }}
                >
                  Retry Job
                </button>
              )}
              
              {(selectedJob.status === 'pending' || selectedJob.status === 'posting') && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleCancelJob(selectedJob.id);
                    setShowJobDetails(false);
                  }}
                >
                  Cancel Job
                </button>
              )}
              
              <button
                className="btn btn-secondary"
                onClick={() => setShowJobDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostingLogs; 