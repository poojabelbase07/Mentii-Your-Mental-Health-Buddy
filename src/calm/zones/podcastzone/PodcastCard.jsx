import React from "react";
import "./PodcastCard.css";

const PodcastCard = ({ podcast }) => {
  return (
    <div className="podcast-card">
      <img src={podcast.thumbnail} alt={podcast.title} className="podcast-thumbnail" />
      <div className="podcast-content">
        <h3 className="podcast-title">{podcast.title}</h3>
        <p className="podcast-description">{podcast.description}</p>
        <p className="podcast-duration">{podcast.duration}</p>
      </div>
    </div>
  );
};

export default PodcastCard;
