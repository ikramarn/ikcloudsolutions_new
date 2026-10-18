import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  X, 
  Layers, 
  Terminal, 
  HelpCircle, 
  UploadCloud,
  FileText,
  BarChart3,
  Video,
  Award,
  Lock,
  ArrowRight
} from 'lucide-react';

export const TrainerStudio = () => {
  const { 
    currentUser, 
    courses, 
    addCourse, 
    updateCourse, 
    deleteCourse, 
    openVideoPlayer, 
    setCurrentTab,
    setAuthModal,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'analytics'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [targetCourseForLesson, setTargetCourseForLesson] = useState(null);

  // New Course Form State
  const [newCourseForm, setNewCourseForm] = useState({
    title: '',
    subtitle: '',
    category: 'Kubernetes & Containers',
    level: 'Architect',
    certification: 'Certified Kubernetes Administrator (CKA)',
    duration: '14h 30m',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=900',
    description: '',
    skillsGained: 'Kubernetes, GitOps, ArgoCD, Helm',
    // First lesson details
    lessonTitle: 'Introduction & Production Cluster Architecture',
    lessonDuration: '18:30',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    terminalCommand: 'kubectl get nodes -o wide',
    terminalOutput: 'NAME                  STATUS   ROLES           AGE   VERSION\nik-control-plane-01   Ready    control-plane   12d   v1.31.1\nik-worker-pool-01     Ready    worker          12d   v1.31.1',
    quizQuestion: 'Which component is the sole state store in Kubernetes control plane?',
    quizOptions: 'etcd, kube-scheduler, kubelet, coredns',
    quizCorrectIndex: 0,
    quizExplanation: 'etcd is the distributed key-value store holding the complete cluster state.'
  });

  // Add Lesson Form State
  const [newLessonForm, setNewLessonForm] = useState({
    title: '',
    duration: '15:00',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    summary: '',
    terminalCommand: 'kubectl get pods -A',
    terminalOutput: 'NAMESPACE     NAME              READY   STATUS\nproduction    ik-payment-api    2/2     Running',
    quizQuestion: 'What triggers automated pod healing in a Kubernetes deployment?',
    quizOptions: 'Kubelet liveness probe failure, DNS lookup, Manual cron, SSH restart',
    quizCorrectIndex: 0,
    quizExplanation: 'When a liveness probe fails, the kubelet kills the container and initiates restart policy.'
  });

  // Filter courses created by this trainer (or show all in demo mode for total management)
  const trainerCourses = courses;

  const handleCreateCourseSubmit = (e) => {
    e.preventDefault();
    if (!newCourseForm.title.trim()) return;

    const courseToCreate = {
      title: newCourseForm.title,
      subtitle: newCourseForm.subtitle || 'Comprehensive hands-on multi-cloud engineering masterclass.',
      category: newCourseForm.category,
      level: newCourseForm.level,
      certification: newCourseForm.certification,
      duration: newCourseForm.duration,
      thumbnail: newCourseForm.thumbnail,
      description: newCourseForm.description || 'Enterprise grade masterclass covering production architecture and continuous delivery.',
      skillsGained: newCourseForm.skillsGained.split(',').map(s => s.trim()),
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          title: 'Module 1: Production Core Architecture & Environment Setup',
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: newCourseForm.lessonTitle || 'Getting Started with Architecture',
              duration: newCourseForm.lessonDuration || '15:20',
              videoUrl: newCourseForm.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              previewAllowed: true,
              summary: 'Learn production-grade deployment patterns, environment bootstrapping, and validation.',
              notes: '### Quick Setup Reference\nEnsure you have configured your cloud CLI credentials.',
              terminalCommand: newCourseForm.terminalCommand || 'kubectl get nodes',
              terminalOutput: newCourseForm.terminalOutput || 'All nodes operational.',
              quiz: {
                question: newCourseForm.quizQuestion,
                options: newCourseForm.quizOptions.split(',').map(o => o.trim()),
                correctIndex: Number(newCourseForm.quizCorrectIndex) || 0,
                explanation: newCourseForm.quizExplanation
              }
            }
          ]
        }
      ]
    };

    addCourse(courseToCreate);
    setIsCreateModalOpen(false);
    // Reset form
    setNewCourseForm({
      title: '',
      subtitle: '',
      category: 'Kubernetes & Containers',
      level: 'Architect',
      certification: 'Certified Kubernetes Administrator (CKA)',
      duration: '14h 30m',
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=900',
      description: '',
      skillsGained: 'Kubernetes, GitOps, ArgoCD, Helm',
      lessonTitle: 'Introduction & Production Cluster Architecture',
      lessonDuration: '18:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      terminalCommand: 'kubectl get nodes -o wide',
      terminalOutput: 'NAME                  STATUS   ROLES           AGE   VERSION\nik-control-plane-01   Ready    control-plane   12d   v1.31.1\nik-worker-pool-01     Ready    worker          12d   v1.31.1',
      quizQuestion: 'Which component is the sole state store in Kubernetes control plane?',
      quizOptions: 'etcd, kube-scheduler, kubelet, coredns',
      quizCorrectIndex: 0,
      quizExplanation: 'etcd is the distributed key-value store holding the complete cluster state.'
    });
  };

  const handleEditCourseSubmit = (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    updateCourse(editingCourse);
    setEditingCourse(null);
  };

  const handleAddLessonSubmit = (e) => {
    e.preventDefault();
    if (!targetCourseForLesson || !newLessonForm.title.trim()) return;

    const newLesson = {
      id: `les-${Date.now()}`,
      title: newLessonForm.title,
      duration: newLessonForm.duration || '15:00',
      videoUrl: newLessonForm.videoUrl,
      previewAllowed: false,
      summary: newLessonForm.summary || 'Deep dive into cloud automation and self-healing pipelines.',
      notes: '### Architecture Blueprint\nReview the terminal output below for live verification.',
      terminalCommand: newLessonForm.terminalCommand || 'kubectl get pods',
      terminalOutput: newLessonForm.terminalOutput || 'Pods running successfully.',
      quiz: {
        question: newLessonForm.quizQuestion,
        options: newLessonForm.quizOptions.split(',').map(o => o.trim()),
        correctIndex: Number(newLessonForm.quizCorrectIndex) || 0,
        explanation: newLessonForm.quizExplanation
      }
    };

    const updated = {
      ...targetCourseForLesson,
      modules: targetCourseForLesson.modules?.map((m, idx) => {
        if (idx === 0) {
          return {
            ...m,
            lessons: [...(m.lessons || []), newLesson]
          };
        }
        return m;
      })
    };

    updateCourse(updated);
    setIsAddLessonModalOpen(false);
    setTargetCourseForLesson(null);
    showToast(`New lesson "${newLesson.title}" added to course!`);
  };

  const handleDelete = (courseId) => {
    deleteCourse(courseId);
    setDeleteConfirmId(null);
  };

  // If user is not logged in or is not a trainer, render a clean access gate
  if (!currentUser || currentUser.role !== 'trainer') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center space-y-6 border border-violet-500/30 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider font-bold">
              FACULTY ACCESS RESTRICTED
            </span>
            <h2 className="text-2xl font-bold text-white font-sans">
              Trainer Studio Access
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              This space is reserved for certified cloud instructors and curriculum authors. Sign in with your trainer credentials or register as a trainer.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => setAuthModal({ isOpen: true, mode: 'login', role: 'trainer' })}
              className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Sign In as Trainer</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAuthModal({ isOpen: true, mode: 'signup', role: 'trainer' })}
              className="w-full py-3 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-violet-400 transition-all"
            >
              Register Trainer Account
            </button>

            <button
              onClick={() => setCurrentTab('academy')}
              className="text-xs text-slate-500 hover:text-cyan-400 pt-2 transition-colors font-mono"
            >
              ← Back to Academy Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] pb-24 text-slate-100">
      
      {/* 1. Trainer Studio Header / Banner */}
      <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-slate-950 border-b border-violet-500/30 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center space-x-4">
              <img
                src={currentUser?.avatar || "/images/team/ikram-ullah.jpg"}
                alt={currentUser?.name || "Trainer"}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-500/50 shadow-xl"
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
                    {currentUser?.name || "Ikram Ullah"}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/30 text-violet-300 border border-violet-500/40">
                    VERIFIED INSTRUCTOR
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {currentUser?.title || "Founder & Lead Cloud Architect · IK Cloud Solutions"}
                </p>
                <div className="flex items-center space-x-3 text-[11px] font-mono text-violet-300 pt-0.5">
                  <span>Creator Portal v2.4</span>
                  <span>•</span>
                  <span>Curriculum Management Hub</span>
                </div>
              </div>
            </div>

            {/* Top Primary Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="glow-button-purple px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2 shadow-lg hover:scale-[1.02] transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Masterclass</span>
              </button>

              <button
                onClick={() => setCurrentTab('academy')}
                className="px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400 transition-all flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Preview Academy Pool</span>
              </button>
            </div>
          </div>

          {/* Trainer Analytics KPI Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="p-4 rounded-xl glass-card space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total Enrolled Engineers</span>
              </span>
              <p className="text-2xl font-bold text-white font-sans">6,840</p>
              <span className="text-[10px] text-emerald-400 font-mono">+18% this month</span>
            </div>

            <div className="p-4 rounded-xl glass-card space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Instructor Rating</span>
              </span>
              <p className="text-2xl font-bold text-white font-sans">4.94 ★</p>
              <span className="text-[10px] text-slate-400 font-mono">From 2,840 student reviews</span>
            </div>

            <div className="p-4 rounded-xl glass-card space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                <span>Active Masterclasses</span>
              </span>
              <p className="text-2xl font-bold text-white font-sans">{courses.length}</p>
              <span className="text-[10px] text-violet-300 font-mono">100% Published & Live</span>
            </div>

            <div className="p-4 rounded-xl glass-card space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Total Video Stream Time</span>
              </span>
              <p className="text-2xl font-bold text-white font-sans">76.5 Hours</p>
              <span className="text-[10px] text-slate-400 font-mono">Across 4 Cloud Domains</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Course Management Table & Studio Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
              Your Course Portfolio & Video Curriculums
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Create, edit, name, organize modules, append lessons, or delete courses. Changes sync to the Academy pool in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-slate-400">
              {trainerCourses.length} Courses Managed
            </span>
          </div>
        </div>

        {/* Courses Table / Cards Grid */}
        <div className="space-y-4">
          {trainerCourses.map((c) => {
            const totalLessons = c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
            return (
              <div
                key={c.id}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-violet-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start sm:items-center space-x-4">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-24 sm:w-32 aspect-video rounded-xl object-cover shrink-0 ring-1 ring-white/10"
                  />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {c.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-white/10">
                        {c.level}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        ● Published & Live
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white font-sans leading-snug">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                      {c.subtitle}
                    </p>

                    <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400 pt-0.5">
                      <span>{c.modules?.length || 1} Modules</span>
                      <span>•</span>
                      <span>{totalLessons} Video Lessons</span>
                      <span>•</span>
                      <span>{c.duration}</span>
                      <span>•</span>
                      <span className="text-amber-400">{c.rating} ★ ({c.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Management Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
                  
                  {/* Preview Button */}
                  <button
                    onClick={() => openVideoPlayer(c)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-xs font-semibold text-cyan-300 hover:text-white transition-all flex items-center space-x-1.5"
                    title="Watch as Student"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Watch</span>
                  </button>

                  {/* Add Lesson Button */}
                  <button
                    onClick={() => {
                      setTargetCourseForLesson(c);
                      setIsAddLessonModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-violet-500/30 hover:border-violet-400 text-xs font-semibold text-violet-300 hover:text-white transition-all flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-4 h-4 text-violet-400" />
                    <span>Add Lesson</span>
                  </button>

                  {/* Edit Course Button */}
                  <button
                    onClick={() => setEditingCourse({ ...c })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-all flex items-center space-x-1.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  {deleteConfirmId === c.id ? (
                    <div className="flex items-center space-x-1 bg-rose-950/80 p-1 rounded-xl border border-rose-500/40">
                      <span className="text-[10px] text-rose-300 font-mono px-1">Confirm?</span>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-1 text-slate-400 hover:text-white text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-all"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Modal: Create New Masterclass */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 glass-panel-glow rounded-2xl border border-violet-500/40 overflow-hidden shadow-2xl text-left">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-violet-950/60 to-slate-900 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trainer Studio · Curriculum Creator</span>
                </span>
                <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                  Create & Publish New Video Masterclass
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCourseSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-1">
                  1. Course Specifications
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Masterclass Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Multi-Cluster Service Mesh with Istio & Cilium"
                    value={newCourseForm.title}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subtitle / Key Outcome *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architect Zero Trust mTLS, Ingress Gateways, and Canary Traffic Shifting"
                    value={newCourseForm.subtitle}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={newCourseForm.category}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-400"
                    >
                      <option value="Kubernetes & Containers">Kubernetes & Containers</option>
                      <option value="AWS & Multi-Cloud">AWS & Multi-Cloud</option>
                      <option value="Terraform & IaC">Terraform & IaC</option>
                      <option value="Agentic AI & MLOps">Agentic AI & MLOps</option>
                      <option value="DevSecOps & Security">DevSecOps & Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Skill Level</label>
                    <select
                      value={newCourseForm.level}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-400"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Architect">Architect</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Total Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 16h 20m"
                      value={newCourseForm.duration}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, duration: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Thumbnail Cover URL</label>
                  <input
                    type="url"
                    value={newCourseForm.thumbnail}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, thumbnail: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-400"
                  />
                  <div className="flex items-center space-x-2 mt-1.5 text-[11px] font-mono text-slate-400">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setNewCourseForm({ ...newCourseForm, thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=900' })}
                      className="text-cyan-400 hover:underline"
                    >
                      Kubernetes
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setNewCourseForm({ ...newCourseForm, thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=900' })}
                      className="text-cyan-400 hover:underline"
                    >
                      Multi-Cloud
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setNewCourseForm({ ...newCourseForm, thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=900' })}
                      className="text-cyan-400 hover:underline"
                    >
                      Agentic AI
                    </button>
                  </div>
                </div>
              </div>

              {/* Initial Lesson / Episode 1 Details */}
              <div className="space-y-4 pt-3 border-t border-white/10">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400 border-b border-white/10 pb-1">
                  2. First Module: Lesson 1 & Sandbox Video Stream
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Lesson 1 Title</label>
                    <input
                      type="text"
                      required
                      value={newCourseForm.lessonTitle}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, lessonTitle: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Video Stream URL</label>
                    <input
                      type="url"
                      required
                      value={newCourseForm.videoUrl}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, videoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Interactive Sandbox CLI Command</label>
                    <input
                      type="text"
                      value={newCourseForm.terminalCommand}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, terminalCommand: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Expected Output</label>
                    <input
                      type="text"
                      value={newCourseForm.terminalOutput}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, terminalOutput: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-violet-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Knowledge Check: Quiz Question</label>
                  <input
                    type="text"
                    value={newCourseForm.quizQuestion}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, quizQuestion: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button-purple px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish to IK Cloud Academy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Edit Existing Course Details */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel-glow rounded-2xl border border-amber-500/40 p-6 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-sans flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Edit Course: {editingCourse.title}</span>
              </h3>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCourseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingCourse.subtitle}
                  onChange={(e) => setEditingCourse({ ...editingCourse, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Level</label>
                  <select
                    value={editingCourse.level}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Architect">Architect</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={editingCourse.thumbnail}
                  onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold uppercase tracking-wider"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Add New Lesson to Course */}
      {isAddLessonModalOpen && targetCourseForLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel-glow rounded-2xl border border-violet-500/40 p-6 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">
                  Append Lesson to:
                </span>
                <h3 className="text-base font-bold text-white font-sans truncate max-w-sm">
                  {targetCourseForLesson.title}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsAddLessonModalOpen(false);
                  setTargetCourseForLesson(null);
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLessonSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Istio Service Mesh mTLS Enforcement & VirtualServices"
                  value={newLessonForm.title}
                  onChange={(e) => setNewLessonForm({ ...newLessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-violet-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={newLessonForm.duration}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Video Stream URL</label>
                  <input
                    type="url"
                    required
                    value={newLessonForm.videoUrl}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Interactive Terminal CLI Command</label>
                <input
                  type="text"
                  value={newLessonForm.terminalCommand}
                  onChange={(e) => setNewLessonForm({ ...newLessonForm, terminalCommand: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Terminal Output</label>
                <input
                  type="text"
                  value={newLessonForm.terminalOutput}
                  onChange={(e) => setNewLessonForm({ ...newLessonForm, terminalOutput: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono focus:outline-none focus:border-violet-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddLessonModalOpen(false);
                    setTargetCourseForLesson(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button-purple px-5 py-2 rounded-xl text-white font-bold uppercase tracking-wider"
                >
                  Save & Append Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
