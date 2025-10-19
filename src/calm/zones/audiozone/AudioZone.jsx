import React from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import PlaylistSection from "./PlaylistSection";
import AudioPlayer from "./AudioPlayer";
import SongList from "./SongList";

const AudioZone = () => {
  return (
    <div className="aud-container">
      <Navbar />
      <Header />
      <PlaylistSection />
      <SongList />
      <AudioPlayer />
    
    </div>
  );
};

export default AudioZone;


