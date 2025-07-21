import React from "react";

const LandingPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
    <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">Employee Onboarding & Management System</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        This project streamlines the onboarding process, manages employee data, tasks, attendance, leaves, meetings, and real-time communication for HR, Admin, and Employees. Built with React, Node.js, Express, MongoDB, and Socket.IO.
      </p>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">About the Developer</h2>
        <p className="text-gray-700 mb-1">Name: <span className="font-medium">Dheeraj Kumar</span></p>
        <p className="text-gray-700 mb-1">Role: Full Stack Developer</p>
        <p className="text-gray-700 mb-1">Email: dheerajgaur.0fficial@gmail.com</p>
        <p className="text-gray-700">Passionate about building scalable web applications and delivering robust solutions for real-world problems.</p>
        <link rel="stylesheet" href="https://dheerajgaurofficial.netlify.app/" />
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Backend API</h2>
        <a href="https://employee-on-boarding-system.onrender.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://employee-on-boarding-system.onrender.com</a>
      </div>
      <div className="flex flex-col items-center">
        <a href="http://localhost:5173/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Get Started</a>
      </div>
    </div>
    <footer className="mt-8 text-gray-500 text-sm">&copy; {new Date().getFullYear()} Dheeraj Gaur. All rights reserved.</footer>
  </div>
);

export default LandingPage;