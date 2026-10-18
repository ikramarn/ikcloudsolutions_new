import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PlayCircle, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  BookOpen, 
  Award, 
  CheckCircle, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Bookmark,
  PlusCircle,
  ExternalLink
} from 'lucide-react';

export const AcademyView = () => {
  const { 
    courses, 
    currentUser, 
    learningProgress, 
    openVideoPlayer, 
    enrollInCourse, 
    setCurrentTab,
    setAuthModal,
    showToast
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('catalog'); // 'catalog' | 'enrolled'

  const categories = [
    'All',
    'Kubernetes & Containers',
    'AWS & Multi-Cloud',
    'Terraform & IaC',
    'Agentic AI & MLOps',
    'DevSecOps & Security'
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Architect'];

  // Filter logic
  const filteredCourses = courses.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    const matchesSearch = !searchQuery.trim() || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skillsGained?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesLevel && matchesSearch;
  });

  const enrolledCourses = courses.filter(c => 
    currentUser?.enrolledCourseIds?.includes(c.id)
  );

  // Featured Hero Course
  const heroCourse = courses.find(c => c.featured) || courses[0];

  return (
    <div className="min-h-screen bg-[#07090e] pb-24 text-slate-100">
      
      {/* 1. Cinema / Netflix-Style Hero Spotlight */}
      <div className="relative w-full min-h-[480px] lg:min-h-[520px] flex items-center bg-slate-950 overflow-hidden border-b border-cyan-500/20">
        
        {/* Background Backdrop Image with Gradient Blending */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroCourse.thumbnail}
            alt={heroCourse.title}
            className="w-full h-full object-cover object-center opacity-30 filter scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/90 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full text-left">
          <div className="max-w-2xl space-y-5">
            
            {/* Spotlight Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider shadow">
                ★ FEATURED MASTERCLASS
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/90 text-cyan-300 border border-cyan-500/30">
                {heroCourse.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/90 text-slate-300 border border-white/10">
                Level: {heroCourse.level}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/90 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                <Award className="w-3 h-3" />
                <span>{heroCourse.certification}</span>
              </span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-sans tracking-tight leading-tight">
              {heroCourse.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {heroCourse.subtitle}
            </p>

            {/* Instructor & Rating strip */}
            <div className="flex items-center space-x-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center space-x-2">
                <img
                  src={heroCourse.trainer?.avatar}
                  alt={heroCourse.trainer?.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-cyan-500/30"
                />
                <span className="text-white font-semibold">{heroCourse.trainer?.name}</span>
              </div>
              <div className="flex items-center space-x-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white font-bold">{heroCourse.rating}</span>
                <span className="text-slate-500">({heroCourse.reviewsCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{heroCourse.duration} total video</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  enrollInCourse(heroCourse.id);
                  openVideoPlayer(heroCourse);
                }}
                className="glow-button px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center space-x-2"
              >
                <PlayCircle className="w-5 h-5 fill-slate-950 text-cyan-400" />
                <span>Watch Episode 1 (Free Preview)</span>
              </button>

              <button
                onClick={() => openVideoPlayer(heroCourse)}
                className="px-5 py-3.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 hover:text-white transition-all flex items-center space-x-1.5"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Explore Full Syllabus ({heroCourse.modules?.length} Modules)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Enrolled Courses Quick Dashboard (for logged in learners) */}
        {currentUser && enrolledCourses.length > 0 && (
          <div className="mb-14 p-6 rounded-2xl glass-card border border-cyan-500/30 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  My Active Learning Tracks ({enrolledCourses.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                Learner: {currentUser.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((c) => {
                const completedCount = learningProgress[c.id]?.completedLessons?.length || 0;
                const totalLessons = c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
                const percent = Math.round((completedCount / totalLessons) * 100);

                return (
                  <div
                    key={c.id}
                    onClick={() => openVideoPlayer(c)}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-400 cursor-pointer transition-all flex items-center space-x-3 group"
                  >
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-16 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                        {c.title}
                      </h4>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-400 h-full rounded-full" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{percent}% Completed</span>
                        <span className="text-cyan-400 font-semibold flex items-center space-x-0.5">
                          <span>Resume</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Search & Filter Bar */}
        <div className="space-y-6 mb-10 text-left">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
                Explore Video Training Catalog
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Browse our curated pool of enterprise cloud video masterclasses, hands-on CLI labs, and exams.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Kubernetes, Terraform, AWS, FinOps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter & Result Count */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Filter Level:</span>
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    selectedLevel === lvl ? 'text-cyan-400 font-bold underline' : 'hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <span>Showing {filteredCourses.length} Masterclasses</span>
          </div>
        </div>

        {/* 4. Course Cards Pool Grid (KodeKloud / Udemy / Netflix layout) */}
        {filteredCourses.length === 0 ? (
          <div className="py-20 text-center space-y-3 glass-card rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No courses match your query</h4>
            <p className="text-xs text-slate-400">Try changing the category or clearing the search bar.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLevel('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-cyan-300 font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = currentUser?.enrolledCourseIds?.includes(course.id);
              const completedCount = learningProgress[course.id]?.completedLessons?.length || 0;
              const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
              const percent = Math.round((completedCount / totalLessons) * 100);

              return (
                <div
                  key={course.id}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300 text-left"
                >
                  {/* Card Media Header */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                    {/* Top tags */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider shadow">
                        {course.badge || course.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/80 text-slate-300 border border-white/10">
                        {course.level}
                      </span>
                    </div>

                    {/* Play overlay button */}
                    <div
                      onClick={() => openVideoPlayer(course)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                        <PlayCircle className="w-7 h-7 fill-slate-950 text-cyan-400" />
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400">
                        <span>{course.category}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-white">{course.rating}</span>
                          <span className="text-slate-500">({course.reviewsCount})</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white font-sans leading-snug group-hover:text-cyan-300 transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {course.subtitle}
                      </p>

                      {/* Skills Gained Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {course.skillsGained?.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-white/10 text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Enrolled Progress Bar */}
                    {isEnrolled && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>Progress: {percent}%</span>
                          <span className="text-cyan-400">{completedCount}/{totalLessons} Done</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Footer Meta & Launch Action */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <img
                            src={course.trainer?.avatar}
                            alt={course.trainer?.name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500/30"
                          />
                          <span className="text-slate-300 text-xs font-medium truncate max-w-[120px]">
                            {course.trainer?.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{course.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (!isEnrolled) {
                              enrollInCourse(course.id);
                            }
                            openVideoPlayer(course);
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
                            isEnrolled
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                          }`}
                        >
                          <PlayCircle className="w-4 h-4 fill-current" />
                          <span>{isEnrolled ? 'Resume Video' : 'Watch Masterclass'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Trainer Callout Banner */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/30 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-violet-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Certified Trainer Portal</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-sans">
              Teach on IK Cloud Academy & Empower Global Engineers
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Are you an expert in Kubernetes, Multi-Cloud, Terraform, or Agentic AI? Sign up as a verified trainer to get your own personalized studio, upload video curriculums, organize modules, and manage course analytics.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {currentUser?.role === 'trainer' ? (
              <button
                onClick={() => setCurrentTab('trainer-studio')}
                className="glow-button-purple px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white"
              >
                Go to My Trainer Studio &rarr;
              </button>
            ) : (
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'signup', role: 'trainer' })}
                className="glow-button-purple px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white"
              >
                Sign Up as Trainer
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
