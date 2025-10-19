import React, { useEffect, useState } from "react";
import PodcastCard from "./PodcastCard";
import {fetchPodcasts} from "./fetch/fetchYouTube";
import headerImage from "../../assets/LaunchAPodcast.jpeg";
import "./PodcastZone.css";

const PodcastZone = () => {
  const [podcasts, setPodcasts] = useState([]);

  useEffect(() => {
    const loadSpecificVideos = async () => {
      const selectedVideos = await fetchPodcasts([
        "YcGXViwXItM", // Add more video IDs here
        "D74vLgMYOxM",
        "9yCqE-uE6HE",
        "eavpj-z5Y4Q",
       "d3R2-nW065U",
       "SoKA0W9PCbs" ,
        "Cr9Ga1EP00Q",
        "ypAHnzD04rg"

      ]);
      setPodcasts(selectedVideos);
    };
  
    loadSpecificVideos();
  }, []);
  

  return (
    <div className="podcast-zone">
      <header className="podcast-header">
        <img src={headerImage} alt="Podcast Mic" className="podcast-logo" />
        <div>
          <h1>Podcast Zone</h1>
          <p>Welcome to the best collection of inspirational podcasts curated for you.</p>
        </div>
      </header>

      <div className="podcast-grid">
        {podcasts.map((podcast, index) => (
          <PodcastCard key={index} podcast={podcast} />
        ))}
      </div>
    </div>
  );
};

export default PodcastZone;
