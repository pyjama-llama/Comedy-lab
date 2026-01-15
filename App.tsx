
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppStatus, AnalysisResult, ChatMessage } from './types';
import { analyzeVideo, analyzeYoutubeVideo, chatWithVideo } from './services/geminiService';
import Header from './components/Header';
import VideoUploader from './components/VideoUploader';
import AnalysisPanel from './components/AnalysisPanel';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isChatting]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setVideoFile(file);
    setYoutubeUrl(null);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setAnalysis(null);
    setSources([]);
    setChatHistory([]);
    setStatus(AppStatus.UPLOADING);

    try {
      const b64 = await convertToBase64(file);
      setVideoBase64(b64);
      setStatus(AppStatus.PROCESSING);
      
      const result = await analyzeVideo(b64, file.type);
      setAnalysis(result);
      setStatus(AppStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleUrlSubmit = async (url: string) => {
    setVideoFile(null);
    setVideoBase64(null);
    setVideoUrl(null);
    setYoutubeUrl(url);
    setAnalysis(null);
    setSources([]);
    setChatHistory([]);
    setStatus(AppStatus.PROCESSING);

    try {
      // Extract Video ID for iframe preview
      let embedUrl = url;
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      }
      setVideoUrl(embedUrl);

      const { analysis: result, sources: resSources } = await analyzeYoutubeVideo(url);
      setAnalysis(result);
      setSources(resSources);
      setStatus(AppStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isChatting) return;

    const currentQuery = userQuery;
    setUserQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: currentQuery }]);
    setIsChatting(true);
    
    try {
      const response = await chatWithVideo(
        videoBase64,
        videoFile?.type || null,
        chatHistory,
        currentQuery,
        youtubeUrl || undefined
      );
      if (response) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I encountered an error analyzing that part of the set. Please try again." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setVideoFile(null);
    setVideoUrl(null);
    setYoutubeUrl(null);
    setVideoBase64(null);
    setAnalysis(null);
    setSources([]);
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {status === AppStatus.IDLE && (
          <div className="mt-12 max-w-2xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Comedy <span className="text-indigo-500">Pulse Analysis</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Upload your specials or provide a YouTube link. Gemini AI scans the delivery and audience reaction for data-driven comedy insights.
              </p>
            </div>
            
            <VideoUploader 
              onFileSelect={handleFileSelect} 
              onUrlSubmit={handleUrlSubmit}
              isLoading={false} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center group hover:border-indigo-500/30 transition-all">
                <i className="fas fa-grin-squint text-indigo-500 text-2xl mb-4"></i>
                <h4 className="font-bold mb-2">Laugh Tracking</h4>
                <p className="text-sm text-slate-500">Pinpoint every chuckle, guffaw, and roar with timestamps.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center group hover:border-indigo-500/30 transition-all">
                <i className="fas fa-stopwatch text-indigo-500 text-2xl mb-4"></i>
                <h4 className="font-bold mb-2">Timing Feedback</h4>
                <p className="text-sm text-slate-500">AI analysis of your setups, punchlines, and pauses.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center group hover:border-indigo-500/30 transition-all">
                <i className="fas fa-chart-bar text-indigo-500 text-2xl mb-4"></i>
                <h4 className="font-bold mb-2">Intensity Meter</h4>
                <p className="text-sm text-slate-500">Visualize audience engagement level across your entire set.</p>
              </div>
            </div>
          </div>
        )}

        {(status === AppStatus.PROCESSING || status === AppStatus.UPLOADING) && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-laugh-beam text-indigo-400 animate-pulse text-2xl"></i>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {status === AppStatus.UPLOADING ? 'Uploading your set...' : 'AI is analyzing the performance...'}
              </h3>
              <p className="text-slate-400 animate-pulse max-w-sm mx-auto">
                {youtubeUrl 
                  ? 'Gathering transcripts and searching for audience reaction data...'
                  : 'Gemini Pro 3 is scanning your timing and reactions frame by frame.'}
              </p>
            </div>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-3xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Analysis Failed</h3>
              <p className="text-slate-400 mt-2">Could not process the content. Make sure the YouTube video is public or try a smaller local file.</p>
            </div>
            <button 
              onClick={reset}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {status === AppStatus.COMPLETED && videoUrl && analysis && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              {/* Video Player Section */}
              <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <div className="aspect-video bg-black flex items-center justify-center">
                  {youtubeUrl ? (
                    <iframe 
                      src={videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                  ) : (
                    <video 
                      src={videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="p-4 flex items-center justify-between border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-300 line-clamp-1 max-w-md">
                      {videoFile ? videoFile.name : (youtubeUrl ? 'YouTube Performance' : 'Comedy Set')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-500 uppercase flex-shrink-0">
                      {videoFile 
                        ? `${((videoFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`
                        : (youtubeUrl ? 'REMOTE URL' : '')}
                    </span>
                  </div>
                  <button onClick={reset} className="text-slate-400 hover:text-white text-sm flex items-center gap-2 flex-shrink-0">
                    <i className="fas fa-redo"></i> New Analysis
                  </button>
                </div>
              </div>

              {/* Specialized Analysis Panel */}
              <AnalysisPanel result={analysis} sources={sources} />
            </div>

            {/* Chat Sidebar */}
            <div className="xl:col-span-1 flex flex-col h-[calc(100vh-160px)] sticky top-24">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col h-full shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <i className="fas fa-robot text-indigo-400"></i>
                    Ask your Comedy Coach
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                        <i className="fas fa-comment-dots text-xl"></i>
                      </div>
                      <p className="text-slate-500 text-sm">
                        "How can I improve the timing on that first joke?" or "What was the audience reaction to the topical bit?"
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' 
                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-slate-800">
                  <form onSubmit={handleChat} className="relative">
                    <input 
                      type="text"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Ask for feedback..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={isChatting || !userQuery.trim()}
                      className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-800 transition-colors"
                    >
                      <i className="fas fa-microphone"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-900 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between text-slate-600 text-xs text-center md:text-left">
          <p>© 2024 VisionQuest Comedy Analyst. Optimized for Performance Optimization.</p>
          <div className="flex gap-6 mt-4 md:mt-0 justify-center">
            <a href="#" className="hover:text-indigo-400">Pro Tips</a>
            <a href="#" className="hover:text-indigo-400">Privacy</a>
            <a href="#" className="hover:text-indigo-400">API Access</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
