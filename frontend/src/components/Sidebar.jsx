import React from "react";
import { NavLink } from "react-router-dom";

const NavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
        isActive ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
      }`
    }
  >
    <span className="text-lg">{icon}</span>
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r bg-white/90 backdrop-blur-sm">
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-500 grid place-items-center text-white font-bold">CL</div>
        <div>
          <p className="text-sm text-gray-500">CampusLearn</p>
          <p className="text-xs text-gray-400">Learn smarter</p>
        </div>
      </div>
      <nav className="px-3 space-y-2">
        <NavItem to="/" label="Home" icon="🏠" />
        <NavItem to="/topics" label="Topics" icon="📚" />
        <NavItem to="/tutors" label="Tutors" icon="👩‍🏫" />
        <NavItem to="/resources" label="Resources" icon="📂" />
        <NavItem to="/messages" label="Messages" icon="💬" />
        <NavItem to="/profile" label="Profile" icon="👤" />
      </nav>
    </aside>
  );
}
