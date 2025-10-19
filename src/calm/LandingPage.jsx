import React from "react";
import "./LandingPage.css";
import yogaImage from "../assets/yoga.png"; // assuming it's the same image as before

const LandingPage = ({ onContinue }) => {
  return (
    <div className="landing-page">
      <img src={yogaImage} alt="Calm Zone" className="yoga-image" />
      <h1>Calm Zone</h1>
      <p>
        Welcome to your safe space, a place where your mind can breathe, unwind,
        and feel lighter.
        <br />
        Whether you're feeling stressed, anxious, or just need a break—this is
        your moment to pause.
      </p>
      <button className="get-started" onClick={onContinue}>
        Get Started
      </button>
    </div>
  );
};

export default LandingPage;
