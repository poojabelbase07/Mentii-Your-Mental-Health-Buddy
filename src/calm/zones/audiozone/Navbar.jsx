import React from "react";
import "./Navbar.css";
import { FaBars } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">Mentii</div>

      {/* Menu Icon */}
      <div className="menu-icon">
        <FaBars />
      </div>
    </nav>
  );
};

export default Navbar;
