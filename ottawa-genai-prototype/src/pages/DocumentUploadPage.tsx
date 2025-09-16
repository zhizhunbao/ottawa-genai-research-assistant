import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, AlertCircle, X, Eye } from 'lucide-react';
import { useLanguage } from '../App';
import './DocumentUploadPage.css';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  uploadedAt: Date;
}

const DocumentUploadPage: React.FC = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'Economic Development Q1 Report.pdf',
      size: 2540000,
      type: 'application/pdf',
      status: 'completed',
      progress: 100,
      uploadedAt: new Date('2024-01-15')
    },
    {
      id: '2', 
      name: 'Small Business Survey Results.pdf',
      size: 1870000,
      type: 'application/pdf',
      status: 'completed',
      progress: 100,
      uploadedAt: new Date('2024-01-10')
    }
  ]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList
      .filter(file => file.type === 'application/pdf')
      .map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading' as const,
        progress: 0,
        uploadedAt: new Date()
      }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload process
    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'completed' as const, progress: 100 }
            : file
        ));
      } else {
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress: Math.round(progress) }
            : file
        ));
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="status-icon completed" size={20} />;
      case 'error':
        return <AlertCircle className="status-icon error" size={20} />;
      default:
        return <div className="upload-spinner" />;
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Document Upload</h1>
          <p>Upload PDF reports to expand the AI knowledge base</p>
        </div>

        {/* Upload Zone */}
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
          role="button"
          tabIndex={0}
          aria-label="Upload documents"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            <Upload size={48} className="upload-icon" />
            <h3>Drop PDF files here or click to browse</h3>
            <p>Supported format: PDF documents only</p>
            <button className="upload-btn">
              Choose Files
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {files.some(file => file.status === 'uploading') && (
          <div className="upload-progress-section">
            <h3>Uploading Files</h3>
            {files
              .filter(file => file.status === 'uploading')
              .map(file => (
                <div key={file.id} className="progress-item">
                  <div className="progress-info">
                    <File size={16} />
                    <span className="file-name">{file.name}</span>
                    <span className="progress-text">{file.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* File List */}
        <div className="file-list-section">
          <div className="section-header">
            <h3>Uploaded Documents ({files.filter(f => f.status === 'completed').length})</h3>
            <p>These documents are available for AI analysis</p>
          </div>

          {files.length === 0 ? (
            <div className="empty-state">
              <File size={48} className="empty-icon" />
              <h4>No documents uploaded yet</h4>
              <p>Upload PDF reports to get started with AI analysis</p>
            </div>
          ) : (
            <div className="file-list">
              {files.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <File size={24} />
                    </div>
                    <div className="file-details">
                      <h4 className="file-name">{file.name}</h4>
                      <div className="file-meta">
                        <span className="file-size">{formatFileSize(file.size)}</span>
                        <span className="file-date">
                          Uploaded {file.uploadedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="file-actions">
                    {getStatusIcon(file.status)}
                    
                    {file.status === 'completed' && (
                      <>
                        <button 
                          className="action-btn preview-btn"
                          aria-label={`Preview ${file.name}`}
                        >
                          <Eye size={16} />
                        </button>
                      </>
                    )}
                    
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="action-btn remove-btn"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processing Status */}
        <div className="processing-status">
          <div className="status-card">
            <h4>📄 Document Processing</h4>
            <p>PDF text extraction and indexing</p>
            <div className="status-indicator completed">Completed</div>
          </div>
          
          <div className="status-card">
            <h4>🔍 Content Analysis</h4>
            <p>AI semantic understanding and categorization</p>
            <div className="status-indicator completed">Completed</div>
          </div>
          
          <div className="status-card">
            <h4>💾 Knowledge Base</h4>
            <p>Integration with search and Q&A system</p>
            <div className="status-indicator completed">Ready</div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="guidelines-section">
          <h3>Upload Guidelines</h3>
          <div className="guidelines-grid">
            <div className="guideline-item">
              <h4>✅ Supported Formats</h4>
              <ul>
                <li>PDF documents only</li>
                <li>Text-based PDFs (not scanned images)</li>
                <li>Maximum file size: 50MB</li>
              </ul>
            </div>
            
            <div className="guideline-item">
              <h4>📋 Best Practices</h4>
              <ul>
                <li>Use descriptive file names</li>
                <li>Ensure documents are not password protected</li>
                <li>Upload the most recent versions</li>
              </ul>
            </div>
            
            <div className="guideline-item">
              <h4>🔒 Privacy & Security</h4>
              <ul>
                <li>Only upload public information</li>
                <li>No personal or confidential data</li>
                <li>Documents are processed locally</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadPage; 