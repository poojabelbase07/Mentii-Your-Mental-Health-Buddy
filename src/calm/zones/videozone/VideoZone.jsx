import React, { useState } from "react";
import videos from "./VideoData";
import "./VideoZone.css";

const VideoZone = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="video-zone-container">
      <header className="video-header">
      <h1>🎬 Video Zone</h1>
      <p className="video-subheading">explore the therapic videos to calm.</p>
      </header>  
      <input
        type="text"
        className="video-search"
        placeholder="Search videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="video-grid">
        {filteredVideos.map((video) => (
          <div className="video-card" key={video.id}>
            <iframe
              className="video-iframe"
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>
            <h3 className="video-title">{video.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoZone;
