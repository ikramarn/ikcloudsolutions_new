import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  CheckCircle, 
  Terminal, 
  FileText, 
  HelpCircle, 
  Download, 
  ChevronRight, 
  Award, 
  Sparkles,
  RefreshCw,
  FastForward,
  RotateCcw
} from 'lucide-react';

export const VideoPlayerModal = () => {
  const { 
    activeVideoModal, 
    closeVideoPlayer, 
    learningProgress, 
    markLessonCompleted, 
    recordQuizResult, 
    showToast 
  } = useApp();

  const { isOpen, course, lesson: initialLesson } = activeVideoModal;
  const [currentLesson, setCurrentLesson] = useState(initialLesson);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'notes' | 'quiz' | 'resources'
  
  // Interactive Terminal state
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  
  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (initialLesson) {
      setCurrentLesson(initialLesson);
      // Initialize terminal with lesson command
      setTerminalHistory([
        { text: `# Automated cloud sandbox initialized: ${initialLesson.title}`, type: 'system' },
        { text: `# Type 'help' or run the lesson command below:`, type: 'system' },
        { text: `$ ${initialLesson.terminalCommand || 'kubectl get nodes'}`, type: 'command' },
        { text: initialLesson.terminalOutput || 'All nodes operational (v1.31.1)', type: 'output' }
      ]);
      setSelectedQuizAnswer(null);
      setQuizSubmitted(false);
    }
  }, [initialLesson]);

  if (!isOpen || !course || !currentLesson) return null;

  const isCompleted = learningProgress[course.id]?.completedLessons?.includes(currentLesson.id);

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleCompleteLesson = () => {
    markLessonCompleted(course.id, currentLesson.id);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
    
    // Find next lesson
    let next = null;
    let foundCurrent = false;
    for (const mod of course.modules || []) {
      for (const les of mod.lessons || []) {
        if (foundCurrent) {
          next = les;
          break;
        }
        if (les.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
      if (next) break;
    }

    if (next) {
      setTimeout(() => {
        setCurrentLesson(next);
      }, 800);
    }
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newHistory = [...terminalHistory, { text: `$ ${terminalInput}`, type: 'command' }];

    if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    }

    if (cmd === 'help') {
      newHistory.push({
        text: "Available sandbox CLI commands:\n  kubectl get nodes\n  kubectl get pods -A\n  terraform plan\n  argocd app list\n  docker ps\n  run-lab",
        type: 'output'
      });
    } else if (cmd === (currentLesson.terminalCommand || '').toLowerCase() || cmd === 'run-lab') {
      newHistory.push({ text: currentLesson.terminalOutput, type: 'output' });
    } else if (cmd.startsWith('kubectl get nodes')) {
      newHistory.push({
        text: "NAME                  STATUS   ROLES           AGE   VERSION\nik-control-plane-01   Ready    control-plane   34d   v1.31.1\nik-worker-pool-01     Ready    worker          34d   v1.31.1\nik-worker-pool-02     Ready    worker          34d   v1.31.1",
        type: 'output'
      });
    } else if (cmd.startsWith('kubectl get pods')) {
      newHistory.push({
        text: "NAMESPACE     NAME                              READY   STATUS    RESTARTS   AGE\nproduction    ik-payment-service-7f89d-pxq2     1/1     Running   0          5d\nproduction    ik-auth-service-58d8c-wlm9        1/1     Running   0          5d\nargocd        argocd-server-64f5c9945b-9d4j2    1/1     Running   0          34d",
        type: 'output'
      });
    } else if (cmd.startsWith('terraform plan')) {
      newHistory.push({
        text: "Terraform will perform the following actions:\n  + module.vpc.aws_vpc.main\n  + module.eks.aws_eks_cluster.production\nPlan: 18 to add, 0 to change, 0 to destroy.",
        type: 'output'
      });
    } else if (cmd.startsWith('argocd app list')) {
      newHistory.push({
        text: "NAME              CLUSTER                         STATUS  HEALTH   SYNCPOLICY\nik-production     https://kubernetes.default.svc  Synced  Healthy  Auto-Prune",
        type: 'output'
      });
    } else if (cmd.startsWith('docker ps')) {
      newHistory.push({
        text: "CONTAINER ID   IMAGE                COMMAND                  STATUS         PORTS\na1b2c3d4e5f6   ikcloud/api:latest   \"./server -port=8080\"   Up 4 days      0.0.0.0:8080->8080/tcp",
        type: 'output'
      });
    } else {
      newHistory.push({
        text: `Command executed: '${terminalInput}'. Output returned exit code 0. (Type 'help' to see sample lab commands)`,
        type: 'output'
      });
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  const handleQuizSubmit = (quiz) => {
    if (selectedQuizAnswer === null) return;
    setQuizSubmitted(true);
    const isCorrect = selectedQuizAnswer === quiz.correctIndex;
    const score = isCorrect ? 100 : 0;
    recordQuizResult(course.id, currentLesson.id, score);
    if (isCorrect) {
      confetti({ particleCount: 50, spread: 50 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-7xl max-h-[96vh] flex flex-col glass-panel-glow rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl">
        
        {/* Top Video Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {course.category}
            </span>
            <span className="text-xs text-slate-400 truncate hidden sm:inline">{course.title}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <h3 className="text-sm font-bold text-white truncate font-sans">
              {currentLesson.title}
            </h3>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {isCompleted ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Completed</span>
              </span>
            ) : (
              <button
                onClick={handleCompleteLesson}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center space-x-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark as Done</span>
              </button>
            )}

            <button
              onClick={closeVideoPlayer}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Middle Stage: Video Screen + Syllabus Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-[380px] bg-slate-950">
          
          {/* Left Column: Custom Video Player (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between relative bg-black group">
            <div className="relative w-full aspect-video max-h-[460px] flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                poster={course.thumbnail}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Center Play Overlay when paused */}
              {!isPlaying && (
                <div 
                  onClick={handleTogglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-500/80 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50 transition-transform transform hover:scale-110">
                    <Play className="w-8 h-8 fill-slate-950 ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleTogglePlay}
                  className="p-1.5 rounded hover:text-cyan-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button 
                  onClick={handleToggleMute}
                  className="p-1.5 rounded hover:text-cyan-400 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="font-mono text-slate-400">{currentLesson.duration}</span>
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400 font-mono">Speed:</span>
                {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      playbackSpeed === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Syllabus & Modules Sidebar (4 cols) */}
          <div className="lg:col-span-4 border-l border-white/10 bg-slate-900/60 flex flex-col h-[460px] overflow-y-auto">
            <div className="p-4 border-b border-white/10 bg-slate-900/80 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Course Syllabus & Playlist
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Total Lessons
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {learningProgress[course.id]?.completedLessons?.length || 0} Done
                </span>
              </div>
            </div>

            {/* Modules and Lessons list */}
            <div className="p-3 space-y-4">
              {course.modules?.map((mod, modIdx) => (
                <div key={mod.id || modIdx} className="space-y-1.5">
                  <div className="text-[11px] font-mono font-semibold text-cyan-300/80 uppercase tracking-wide px-2">
                    {mod.title}
                  </div>
                  <div className="space-y-1">
                    {mod.lessons?.map((les, lesIdx) => {
                      const active = les.id === currentLesson.id;
                      const completed = learningProgress[course.id]?.completedLessons?.includes(les.id);
                      return (
                        <div
                          key={les.id || lesIdx}
                          onClick={() => setCurrentLesson(les)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start space-x-2.5 ${
                            active 
                              ? 'bg-cyan-950/60 border border-cyan-400/50 shadow-sm shadow-cyan-500/20 text-white' 
                              : 'bg-slate-900/40 border border-white/5 hover:border-white/15 text-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {completed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono ${
                                active ? 'border-cyan-400 text-cyan-300' : 'border-slate-600 text-slate-500'
                              }`}>
                                {lesIdx + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug line-clamp-2 ${active ? 'font-bold text-cyan-200' : 'font-medium'}`}>
                              {les.title}
                            </p>
                            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                              {les.duration}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Interactive Workspace: Terminal, Notes, Quiz, Resources */}
        <div className="border-t border-white/10 bg-slate-950 flex flex-col flex-1 min-h-[220px]">
          
          {/* Tab Navigation */}
          <div className="flex items-center px-4 pt-2 border-b border-white/10 bg-slate-900/70 space-x-2">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-t-lg transition-all flex items-center space-x-1.5 border-t border-x ${
                activeTab === 'terminal'
                  ? 'bg-slate-950 border-cyan-500/40 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Cloud CLI Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-t-lg transition-all flex items-center space-x-1.5 border-t border-x ${
                activeTab === 'notes'
                  ? 'bg-slate-950 border-cyan-500/40 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Architecture Notes & IaC</span>
            </button>

            {currentLesson.quiz && (
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-t-lg transition-all flex items-center space-x-1.5 border-t border-x ${
                  activeTab === 'quiz'
                    ? 'bg-slate-950 border-cyan-500/40 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Knowledge Check</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-t-lg transition-all flex items-center space-x-1.5 border-t border-x ${
                activeTab === 'resources'
                  ? 'bg-slate-950 border-cyan-500/40 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Downloadable Blueprints</span>
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[260px]">
            
            {/* 1. Terminal CLI Tab */}
            {activeTab === 'terminal' && (
              <div className="font-mono text-xs rounded-xl bg-black border border-cyan-500/20 p-4 space-y-2 h-full flex flex-col justify-between shadow-inner">
                <div className="overflow-y-auto space-y-1.5 max-h-40">
                  {terminalHistory.map((item, idx) => (
                    <div key={idx} className={`${
                      item.type === 'command' 
                        ? 'text-cyan-400 font-bold' 
                        : item.type === 'system' 
                        ? 'text-slate-500' 
                        : 'text-slate-300 whitespace-pre-wrap pl-2 border-l border-cyan-500/30'
                    }`}>
                      {item.text}
                    </div>
                  ))}
                </div>

                {/* Input Prompt */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center space-x-2 pt-2 border-t border-white/10">
                  <span className="text-cyan-400 font-bold">ik-cloud@sandbox:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder={`Try '${currentLesson.terminalCommand || "kubectl get nodes"}' or 'help'...`}
                    className="flex-1 bg-transparent text-white focus:outline-none placeholder:text-slate-600 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currentLesson.terminalCommand) {
                        setTerminalInput(currentLesson.terminalCommand);
                      }
                    }}
                    className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900"
                  >
                    Paste Lab Cmd
                  </button>
                </form>
              </div>
            )}

            {/* 2. Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
                  <h5 className="font-bold text-white font-sans text-sm mb-1.5">
                    Lesson Architecture Summary
                  </h5>
                  <p className="leading-relaxed text-slate-400">
                    {currentLesson.summary || "In this module we explore enterprise configuration, cluster high availability, and declarative GitOps pipelines."}
                  </p>
                </div>

                {currentLesson.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-cyan-500/20 font-mono text-cyan-300 whitespace-pre-wrap">
                    {currentLesson.notes}
                  </div>
                )}
              </div>
            )}

            {/* 3. Quiz Tab */}
            {activeTab === 'quiz' && currentLesson.quiz && (
              <div className="max-w-2xl mx-auto space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/20">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                    Knowledge Assessment
                  </span>
                  <h5 className="text-sm font-semibold text-white mt-1">
                    {currentLesson.quiz.question}
                  </h5>

                  <div className="mt-3 space-y-2">
                    {currentLesson.quiz.options.map((opt, idx) => {
                      const isSelected = selectedQuizAnswer === idx;
                      let optionStyle = "border-white/10 bg-slate-800/40 text-slate-300 hover:border-white/20";

                      if (quizSubmitted) {
                        if (idx === currentLesson.quiz.correctIndex) {
                          optionStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold";
                        } else if (isSelected) {
                          optionStyle = "border-rose-500 bg-rose-950/40 text-rose-300";
                        }
                      } else if (isSelected) {
                        optionStyle = "border-cyan-400 bg-cyan-950/40 text-cyan-200";
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => !quizSubmitted && setSelectedQuizAnswer(idx)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-center space-x-2 ${optionStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-mono">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={() => handleQuizSubmit(currentLesson.quiz)}
                      disabled={selectedQuizAnswer === null}
                      className="mt-3 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold disabled:opacity-50 transition-all"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-white/10 space-y-1">
                      <p className={`font-bold ${selectedQuizAnswer === currentLesson.quiz.correctIndex ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedQuizAnswer === currentLesson.quiz.correctIndex ? "✓ Correct!" : "✗ Incorrect"}
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {currentLesson.quiz.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Resources Tab */}
            {activeTab === 'resources' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h6 className="font-bold text-white">Kubernetes Manifests & Helm Charts</h6>
                    <p className="text-[11px] text-slate-500">production-topology-v1.31.tar.gz</p>
                  </div>
                  <button 
                    onClick={() => showToast("Downloading Helm & IaC blueprint package...")}
                    className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h6 className="font-bold text-white">Terraform Multi-Cloud VPC Module</h6>
                    <p className="text-[11px] text-slate-500">aws-azure-transit-gateway.tf</p>
                  </div>
                  <button 
                    onClick={() => showToast("Downloading Terraform IaC code snippets...")}
                    className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
