import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PlayCircle, 
  Star, 
  Clock, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle,
  GraduationCap
} from 'lucide-react';

export const FeaturedCoursesBanner = () => {
  const { courses, setCurrentTab, openVideoPlayer, enrollInCourse, currentUser, learningProgress } = useApp();

  const featured = courses.slice(0, 3);

  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>IK Cloud Academy: Training Videos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
              Master Multi-Cloud with Hands-On Video Masterclasses
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Real-world architectures taught by CEO Ikram Ullah and enterprise cloud architects. Includes interactive browser sandboxes, CLI playgrounds, and certification prep.
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentTab('academy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center space-x-2 shrink-0"
          >
            <span>View All Courses & Tracks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Featured Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((course) => {
            const isEnrolled = currentUser?.enrolledCourseIds?.includes(course.id);
            const completedCount = learningProgress[course.id]?.completedLessons?.length || 0;
            const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
            const progressPercent = Math.round((completedCount / totalLessons) * 100);

            return (
              <div
                key={course.id}
                className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300"
              >
                {/* Thumbnail with overlay */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider shadow">
                    {course.badge || course.category}
                  </span>

                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/80 text-slate-300 border border-white/10">
                    {course.level}
                  </span>

                  {/* Play Button Overlay */}
                  <div
                    onClick={() => openVideoPlayer(course)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                      <PlayCircle className="w-7 h-7 fill-slate-950 text-cyan-400" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
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
                  </div>

                  {/* Progress bar if enrolled */}
                  {isEnrolled && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>Progress: {progressPercent}%</span>
                        <span className="text-cyan-400">{completedCount}/{totalLessons} Lessons</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Instructor & Meta */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={course.trainer?.avatar}
                        alt={course.trainer?.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500/30"
                      />
                      <span className="text-xs text-slate-300 font-medium">
                        {course.trainer?.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Launch button */}
                  <button
                    onClick={() => {
                      if (!isEnrolled) {
                        enrollInCourse(course.id);
                      }
                      openVideoPlayer(course);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
                      isEnrolled
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4 fill-current" />
                    <span>{isEnrolled ? 'Resume Masterclass' : 'Start Free Training'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
