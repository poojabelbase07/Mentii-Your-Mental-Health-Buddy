import React from "react";
import "./Header.css";
import audioGirl from "../../assets/audio.jpeg";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <img src={audioGirl} alt="Audio Zone Girl" className="header-image" />
        <div className="header-text">
          <h1 className="header-title">Audio Zone</h1>
          <p className="header-description">
          Plug in. Zone out. Let the sound fix what words can't.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
