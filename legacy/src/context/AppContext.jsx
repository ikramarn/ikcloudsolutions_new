import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COURSES, INITIAL_SERVICES, INITIAL_LEADERSHIP } from '../data/initialData';

const AppContext = createContext();

// Official Founder & Trainer Account
export const DEFAULT_ACCOUNTS = [
  {
    id: "trainer-ikram",
    name: "Ikram Ullah",
    role: "trainer",
    email: "ikram@ikcloudsolutions.com",
    password: "password123",
    title: "Founder & Lead Cloud Architect",
    avatar: "/images/team/ikram-ullah.jpg",
    bio: "Senior Enterprise Cloud & DevOps Architect. Specializing in high-velocity GitOps and FinOps multi-cloud infrastructures.",
    enrolledCourseIds: ["course-k8s-prod"],
    bookmarkedCourseIds: []
  }
];

// Backwards compatibility export
export const DEMO_USERS = {
  trainer: DEFAULT_ACCOUNTS[0]
};

export const AppProvider = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('home'); // 'home' | 'services' | 'academy' | 'trainer-studio' | 'simulator' | 'about' | 'contact'
  
  // Real Registered Accounts Directory (persistent in localStorage)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('ik_cloud_registered_users');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        // Filter out legacy demo Alex Chen
        const filtered = list.filter(u => u.id !== 'user-alex' && u.name !== 'Alex Chen');
        const hasIkram = filtered.some(u => u.email.toLowerCase() === 'ikram@ikcloudsolutions.com');
        if (!hasIkram) {
          filtered.push(DEFAULT_ACCOUNTS[0]);
        }
        return filtered;
      } catch {
        return DEFAULT_ACCOUNTS;
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  // Auth state: Defaults to null (Guest explorer mode)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ik_cloud_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically purge any legacy demo learner sessions
        if (!parsed || parsed.id === 'user-alex' || parsed.id === 'learner-alex' || parsed.name === 'Alex Chen') {
          localStorage.removeItem('ik_cloud_user');
          return null;
        }
        if (parsed.avatar && parsed.avatar.includes('53994a69daeb')) {
          parsed.avatar = '/images/team/ikram-ullah.jpg';
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Courses state with persistence
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('ik_cloud_courses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(c => {
          if (c.trainer?.avatar?.includes('53994a69daeb')) {
            return { ...c, trainer: { ...c.trainer, avatar: '/images/team/ikram-ullah.jpg' } };
          }
          if (c.trainer?.avatar?.includes('1580489944761')) {
            return { ...c, trainer: { ...c.trainer, avatar: '/images/team/avatar-priya.svg' } };
          }
          return c;
        });
      } catch {
        return INITIAL_COURSES;
      }
    }
    return INITIAL_COURSES;
  });

  // Learner Progress state
  const [learningProgress, setLearningProgress] = useState(() => {
    const saved = localStorage.getItem('ik_cloud_progress');
    return saved ? JSON.parse(saved) : {
      "course-k8s-prod": {
        completedLessons: ["les-1-1"],
        currentLessonId: "les-1-2",
        quizScores: { "les-1-1": 100 }
      },
      "course-aws-architect": {
        completedLessons: [],
        currentLessonId: "les-aws-1-1",
        quizScores: {}
      }
    };
  });

  // Modal states
  const [activeVideoModal, setActiveVideoModal] = useState({
    isOpen: false,
    course: null,
    lesson: null
  });

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login', // 'login' | 'signup'
    role: 'learner' // 'learner' | 'trainer'
  });

  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Sync registered users and current user to local storage
  useEffect(() => {
    localStorage.setItem('ik_cloud_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ik_cloud_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ik_cloud_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ik_cloud_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('ik_cloud_progress', JSON.stringify(learningProgress));
  }, [learningProgress]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Real User Authentication & Registration
  const signupUser = ({ name, email, password, role = 'learner', title = '', bio = '' }) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanName = name ? name.trim() : '';

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please provide a valid email address (e.g. name@company.com).' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long for account security.' };
    }

    // Check if account already exists
    const exists = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    // Avatar generation
    let avatar = '/images/team/ikram-ullah.jpg';
    if (role === 'learner' || !cleanName.toLowerCase().includes('ikram')) {
      avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=0284c7,4f46e5,0d9488&textColor=ffffff`;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password,
      role: role || 'learner',
      title: title.trim() || (role === 'trainer' ? 'Certified Cloud Instructor' : 'Cloud & DevOps Engineer'),
      bio: bio.trim() || (role === 'trainer' ? 'Enterprise Cloud Architect & Instructor at IK Cloud Solutions.' : 'Active Cloud & DevOps practitioner on IK Cloud Academy.'),
      avatar,
      createdAt: new Date().toISOString(),
      enrolledCourseIds: [],
      bookmarkedCourseIds: []
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setAuthModal({ isOpen: false, mode: 'login', role: 'learner' });
    showToast(`Account created successfully! Welcome aboard, ${newUser.name}.`);

    if (newUser.role === 'trainer') {
      setCurrentTab('trainer-studio');
    }

    return { success: true, user: newUser };
  };

  const loginUser = ({ email, password }) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const matched = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      return { success: false, error: 'No account registered with this email. Please register for an account.' };
    }

    if (matched.password && matched.password !== password) {
      return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
    }

    setCurrentUser(matched);
    setAuthModal({ isOpen: false, mode: 'login', role: matched.role || 'learner' });
    showToast(`Welcome back, ${matched.name}!`);

    if (matched.role === 'trainer') {
      setCurrentTab('trainer-studio');
    }

    return { success: true, user: matched };
  };

  // Backwards-compatible login handler
  const login = (userOrCredentials) => {
    if (userOrCredentials && userOrCredentials.email && !userOrCredentials.id) {
      return loginUser(userOrCredentials);
    }
    setCurrentUser(userOrCredentials);
    setAuthModal({ isOpen: false, mode: 'login', role: userOrCredentials?.role || 'learner' });
    showToast(`Welcome, ${userOrCredentials?.name || 'Explorer'}!`);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ik_cloud_user');
    showToast("Signed out successfully. Switched to Guest explorer mode.", "info");
    if (currentTab === 'trainer-studio') {
      setCurrentTab('home');
    }
  };

  const switchRole = (role) => {
    if (role === 'trainer') {
      const ikram = registeredUsers.find(u => u.email.toLowerCase() === 'ikram@ikcloudsolutions.com') || DEFAULT_ACCOUNTS[0];
      setCurrentUser(ikram);
      setCurrentTab('trainer-studio');
      showToast("Signed into Trainer Studio (Ikram Ullah)");
    } else {
      setCurrentUser(null);
      showToast("Switched to Guest Explorer mode");
    }
  };

  // Course actions (for Trainer and Learner)
  const addCourse = (newCourse) => {
    const courseWithId = {
      ...newCourse,
      id: `course-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      enrolledCount: 0,
      badge: "New Release",
      trainer: {
        id: currentUser ? currentUser.id : "trainer-custom",
        name: currentUser ? currentUser.name : "Lead Architect",
        title: currentUser?.title || "Cloud Instructor",
        avatar: currentUser?.avatar || "/images/team/ikram-ullah.jpg",
        company: "IK Cloud Solutions"
      }
    };
    setCourses(prev => [courseWithId, ...prev]);
    showToast(`Masterclass "${newCourse.title}" published to IK Cloud Academy!`);
    return courseWithId;
  };

  const updateCourse = (updatedCourse) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    showToast(`Course "${updatedCourse.title}" updated successfully.`);
  };

  const deleteCourse = (courseId) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    showToast(`Course "${courseToDelete?.title || 'Selected Course'}" deleted from catalog.`, 'info');
  };

  // Learner Progress Actions
  const enrollInCourse = (courseId) => {
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'signup', role: 'learner' });
      return;
    }
    if (!currentUser.enrolledCourseIds.includes(courseId)) {
      setCurrentUser(prev => ({
        ...prev,
        enrolledCourseIds: [...prev.enrolledCourseIds, courseId]
      }));
    }
    if (!learningProgress[courseId]) {
      const course = courses.find(c => c.id === courseId);
      const firstLesson = course?.modules?.[0]?.lessons?.[0]?.id || '';
      setLearningProgress(prev => ({
        ...prev,
        [courseId]: {
          completedLessons: [],
          currentLessonId: firstLesson,
          quizScores: {}
        }
      }));
    }
    showToast("Enrolled in masterclass! Your progress is now being tracked.");
  };

  const markLessonCompleted = (courseId, lessonId) => {
    setLearningProgress(prev => {
      const current = prev[courseId] || { completedLessons: [], quizScores: {} };
      if (current.completedLessons.includes(lessonId)) return prev;
      return {
        ...prev,
        [courseId]: {
          ...current,
          completedLessons: [...current.completedLessons, lessonId],
          currentLessonId: lessonId
        }
      };
    });
    showToast("Lesson completed! Knowledge progress updated.");
  };

  const recordQuizResult = (courseId, lessonId, score) => {
    setLearningProgress(prev => {
      const current = prev[courseId] || { completedLessons: [], quizScores: {} };
      return {
        ...prev,
        [courseId]: {
          ...current,
          quizScores: {
            ...current.quizScores,
            [lessonId]: score
          }
        }
      };
    });
    showToast(`Quiz completed: ${score}% score registered!`);
  };

  const openVideoPlayer = (course, lesson) => {
    // If no specific lesson provided, find current progress or first lesson
    let targetLesson = lesson;
    if (!targetLesson && course.modules?.[0]?.lessons?.[0]) {
      const currentLessonId = learningProgress[course.id]?.currentLessonId;
      if (currentLessonId) {
        for (const mod of course.modules) {
          const found = mod.lessons.find(l => l.id === currentLessonId);
          if (found) {
            targetLesson = found;
            break;
          }
        }
      }
      if (!targetLesson) {
        targetLesson = course.modules[0].lessons[0];
      }
    }
    setActiveVideoModal({
      isOpen: true,
      course,
      lesson: targetLesson
    });
  };

  const closeVideoPlayer = () => {
    setActiveVideoModal({
      isOpen: false,
      course: null,
      lesson: null
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        currentUser,
        setCurrentUser,
        registeredUsers,
        signupUser,
        loginUser,
        login,
        logout,
        switchRole,
        courses,
        setCourses,
        addCourse,
        updateCourse,
        deleteCourse,
        learningProgress,
        enrollInCourse,
        markLessonCompleted,
        recordQuizResult,
        activeVideoModal,
        setActiveVideoModal,
        openVideoPlayer,
        closeVideoPlayer,
        authModal,
        setAuthModal,
        isConsultationModalOpen,
        setIsConsultationModalOpen,
        notification,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
