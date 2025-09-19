import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import { StatCard, TutorCard, ResourceCard } from "./components/Cards.jsx";
import FileUpload from "./components/FileUpload.jsx";
import FileList   from "./components/FileList.jsx";

function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      <div className="rounded-2xl bg-blue-400 text-white p-6">
        <p className="text-xl font-semibold">Welcome back, Bahle!</p>
        <p className="text-sm opacity-95">Enjoy and explore more on CampusLearn.</p>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">My Topics</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Data Analytics" status="In Progress" progress="35%" />
          <StatCard title="Business Intelligence" status="In Progress" progress="20%" />
          <StatCard title="Programming" status="Completed" progress="100%" />
          <StatCard title="Linear Programming" status="Not started" progress="0%" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Recommended Tutors</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TutorCard name="Mr Max" subject="Mathematics" />
          <TutorCard name="Ms Lee" subject="Data" />
          <TutorCard name="Mr White" subject="Business" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Recent Resources</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResourceCard title="Linear Programming - Study Guide" />
          <ResourceCard title="Introduction to Data Analytics" />
          <ResourceCard title="Fundamentals of BI" />
          <ResourceCard title="Basic Programming" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Uploads</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border p-4">
            <h4 className="font-medium mb-2">Upload Files</h4>
            <FileUpload />
          </div>
          <div className="bg-white rounded-2xl border p-4">
            <h4 className="font-medium mb-2">Uploaded Files</h4>
            <FileList />
          </div>
        </div>
      </section>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-500 mt-2">Coming soon…</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/topics" element={<Placeholder title="Topics" />} />
              <Route path="/tutors" element={<Placeholder title="Tutors" />} />
              <Route path="/resources" element={<Placeholder title="Resources" />} />
              <Route path="/messages" element={<Placeholder title="Messages" />} />
              <Route path="/profile" element={<Placeholder title="Profile" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
