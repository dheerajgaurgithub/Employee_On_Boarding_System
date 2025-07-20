import React, { useState, useEffect } from "react";
import { Users, Calendar, MessageCircle, BarChart3, Shield, Rocket } from "lucide-react";

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    { icon: Users, title: "Employee Management", desc: "Complete employee lifecycle management" },
    { icon: Calendar, title: "Smart Scheduling", desc: "Attendance, leaves & meeting coordination" },
    { icon: MessageCircle, title: "Real-time Communication", desc: "Instant messaging with Socket.IO" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Insights and performance tracking" },
    { icon: Shield, title: "Role-based Access", desc: "Secure HR, Admin & Employee portals" },
    { icon: Rocket, title: "Streamlined Onboarding", desc: "Automated new hire processes" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20"></div>
      
      {/* Floating orbs */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
        style={{
          left: `${mousePosition.x * 0.02}px`,
          top: `${mousePosition.y * 0.02}px`,
          transform: `translate(-50%, -50%) translateY(${scrollY * -0.1}px)`
        }}
      ></div>
      
      <div 
        className="absolute w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"
        style={{
          right: `${mousePosition.x * -0.01}px`,
          bottom: `${mousePosition.y * -0.01}px`,
          transform: `translate(50%, 50%) translateY(${scrollY * -0.15}px)`,
          animationDelay: '1s'
        }}
      ></div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="text-center mb-12 max-w-5xl">
            <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
              <span className="text-purple-300 text-sm font-medium">Next-Gen Workforce Management</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Employee
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                Onboarding
              </span>
              <br />
              <span className="text-white/90">& Management</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
              Revolutionary platform that transforms HR operations with intelligent automation, 
              real-time collaboration, and seamless employee experiences. Built for the future of work.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mb-16">
              <a 
                href="/login" 
                className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Launch Platform</span>
              </a>
              
              <a 
                href="https://employee-on-boarding-system.onrender.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-12 py-4 border border-white/20 rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
              >
                Explore API
              </a>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-purple-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-200 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack section */}
        <div className="py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-white/90">Powered by Modern Technology</h2>
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
              {['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO'].map((tech, index) => (
                <div 
                  key={tech}
                  className="px-6 py-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Developer section */}
        <div className="py-20 px-6 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-8 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm font-medium">Meet the Developer</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dheeraj Gaur
            </h2>
            <p className="text-xl text-gray-300 mb-8">Full Stack Developer</p>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
              Passionate about building scalable web applications and delivering robust solutions 
              for real-world problems. Transforming ideas into powerful digital experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              <a 
                href="https://dheerajgaurofficial.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors duration-300 underline decoration-purple-400/50 hover:decoration-purple-300"
              >
                View Portfolio →
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-white/10">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} Dheeraj Gaur. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;