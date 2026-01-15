
import React, { useRef, useState } from 'react';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, onUrlSubmit, isLoading }) => {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Please select a video smaller than 50MB for this demonstration.");
        return;
      }
      onFileSelect(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url.trim());
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800">
        <button 
          onClick={() => setMode('file')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'file' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <i className="fas fa-file-video mr-2"></i> Local File
        </button>
        <button 
          onClick={() => setMode('url')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'url' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <i className="fab fa-youtube mr-2"></i> YouTube URL
        </button>
      </div>

      {mode === 'file' ? (
        <div 
          onClick={!isLoading ? triggerUpload : undefined}
          className={`relative group border-2 border-dashed border-slate-700 rounded-2xl p-12 transition-all cursor-pointer overflow-hidden
            ${!isLoading ? 'hover:border-indigo-500 hover:bg-indigo-500/5' : 'opacity-50 cursor-not-allowed'}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/*" 
            className="hidden" 
          />
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all shadow-inner">
              <i className="fas fa-cloud-upload-alt text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Upload Comedy Set</h3>
            <p className="text-slate-400 max-w-sm mb-6">
              Drag and drop your set (MP4/MOV) or click to browse. Max 50MB.
            </p>
            <button 
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-600/20"
            >
              Select Video
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10">
          <form onSubmit={handleUrlSubmit} className="space-y-6 flex flex-col items-center text-center">
             <div className="w-20 h-20 mb-2 rounded-full bg-slate-800 flex items-center justify-center text-rose-500 shadow-inner">
              <i className="fab fa-youtube text-4xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">Analyze YouTube Video</h3>
              <p className="text-slate-400 max-w-sm">
                Paste a public YouTube link. AI will research the performance and audience reactions.
              </p>
            </div>
            <div className="w-full relative">
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all pr-32"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !url.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                Analyze
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
