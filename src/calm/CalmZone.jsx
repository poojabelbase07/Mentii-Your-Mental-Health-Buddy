import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import CardLayout from "./CardLayout";
import AudioZone from "../zones/audiozone/AudioZone";
import BookZone from "../zones/bookzone/BookZone";
import VideoZone from "../zones/videozone/VideoZone";
import PodcastZone from "../zones/podcastzone/PodcastZone";
// Import other zones as you finish them
// import VideoZone from "../zones/VideoZone";
// import BookZone from "../zones/BookZone";
// ...and so on

const CalmZone = () => {
  const [started, setStarted] = useState(false);

  const handleContinue = () => {
    setStarted(true);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !started ? (
              <LandingPage onContinue={handleContinue} />
            ) : (
              <CardLayout />
            )
          }
        />
        <Route path="/calm/audio" element={<AudioZone />} />
        <Route path="/calm/book" element={<BookZone />} />
        <Route path="/calm/video" element={<VideoZone />} />
        <Route path="/calm/podcast" element={<PodcastZone />} />
        {   }
        {/* <Route path="/video" element={<VideoZone />} /> */}
        {/* <Route path="/book" element={<BookZone />} /> */}
        {/* <Route path="/podcast" element={<PodcastZone />} /> */}
        {/* <Route path="/game" element={<GameZone />} /> */}
        {/* <Route path="/spiritual" element={<SpiritualZone />} /> */}
      </Routes>
    </Router>
  );
};

export default CalmZone;
