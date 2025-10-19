import React from "react";
import "./SongList.css";
import song1 from "../../assets/song1.jpeg"; 

const songs = [
  { id: 1, title: "Peaceful Mind", artist: "Relax Beats", duration: "3:45", img: song1},
  { id: 2, title: "Deep Focus", artist: "Study Crew", duration: "4:12", img: song1},
  { id: 3, title: "Night Breeze", artist: "Dreamy Vibes", duration: "5:02", img: song1},
  { id: 4, title: "Morning Glow", artist: "Sunrise Tunes", duration: "3:30", img: song1},
  { id: 5, title: "Calm Ocean", artist: "Nature Sounds", duration: "4:50", img: song1},
  { id: 6, title: "City Lights", artist: "Lo-Fi Mix", duration: "3:55", img: song1},
  { id: 7, title: "Soothing Rain", artist: "Nature Symphony", duration: "4:20", img: song1}
];

const SongList = () => {
  return (
    <section className="song-list">
      <div className="categories">
        <span>ALL</span>
        <span>Study</span>
        <span>Focus</span>
        <span>Sleep</span>
        <span>Work</span>
        <span>Nature</span>
        <span>Morning</span>
        <span>Liked</span>
      </div>

      <div className="song-container">
        {songs.map((song) => (
          <div key={song.id} className="song-card">
            <img src={song.img} alt={song.title} className="song-img" />
            <div className="song-info">
              <h4>{song.title}</h4>
              <p>{song.artist}</p>
            </div>
            <span className="song-duration">{song.duration}</span>
            <button className="play-button">▶</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SongList;
