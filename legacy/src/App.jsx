import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ConsultationModal } from './components/ConsultationModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { NotificationToast } from './components/NotificationToast';

// Home sections
import { HeroSection } from './components/home/HeroSection';
import { StatsBar } from './components/home/StatsBar';
import { ServicesGrid } from './components/home/ServicesGrid';
import { ArchitectureSimulator } from './components/home/ArchitectureSimulator';
import { FeaturedCoursesBanner } from './components/home/FeaturedCoursesBanner';
import { CaseStudiesSection } from './components/home/CaseStudiesSection';
import { TeamSection } from './components/home/TeamSection';
import { ContactSection } from './components/home/ContactSection';

// Dedicated views
import { AcademyView } from './components/academy/AcademyView';
import { TrainerStudio } from './components/trainer/TrainerStudio';
import { ServicesView } from './components/services/ServicesView';

export function App() {
  const { currentTab } = useApp();

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <HeroSection />
            <StatsBar />
            <ServicesGrid />
            <ArchitectureSimulator />
            <FeaturedCoursesBanner />
            <CaseStudiesSection />
            <TeamSection />
            <ContactSection />
          </>
        )}

        {currentTab === 'services' && <ServicesView />}

        {currentTab === 'academy' && <AcademyView />}

        {currentTab === 'trainer-studio' && <TrainerStudio />}

        {currentTab === 'simulator' && (
          <div className="pt-8">
            <ArchitectureSimulator />
          </div>
        )}

        {currentTab === 'about' && (
          <div className="pt-8">
            <TeamSection />
            <CaseStudiesSection />
          </div>
        )}

        {currentTab === 'contact' && (
          <div className="pt-8">
            <ContactSection />
          </div>
        )}
      </main>

      {/* Global Modals & Notifications */}
      <VideoPlayerModal />
      <AuthModal />
      <ConsultationModal />
      <NotificationToast />

      {/* Corporate Futuristic Footer */}
      <Footer />
    </div>
  );
}

export default App;
