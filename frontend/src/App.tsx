import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CreateAnnouncement from "./components/Create";
import VerifyAnnouncement from "./components/Verify";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Create</Link>
        <Link to="/verify">Verify</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CreateAnnouncement />} />
        <Route path="/verify" element={<VerifyAnnouncement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
