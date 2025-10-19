import React, { useState } from "react";
import "./PlaylistSection.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import playlistImg from "../../assets/playlist.jpeg"; 
import playlistImg1 from "../../assets/playlist1.jpeg"; 
import playlistImg2 from "../../assets/playlist2.jpeg"; 
import playlistImg3 from "../../assets/playlist3.jpeg"; 
import playlistImg4 from "../../assets/playlist4.jpeg"; 
import playlistImg5 from "../../assets/playlist5.jpeg"; 
import playlistImg6 from "../../assets/playlist6.jpeg"; 
// Dummy Playlist Data
const playlists = [
  { id: 1, name: "Study", desc: "Stay focused & productive.", img: "playlist1.jpeg" },
  { id: 2, name: "Sleep", desc: "Relax and fall asleep easily.", img: "playlist2.jpeg" },
  { id: 3, name: "Workout", desc: "Boost your energy & motivation.", img: "playlist3.jpeg" },
  { id: 4, name: "Chill", desc: "Loosen up with soft beats.", img: "playlist4.jpeg" },
  { id: 5, name: "Nature", desc: "Feel the calm of nature.", img: "playlist5.jpeg" },
  { id: 6, name: "Morning", desc: "Start your day with positivity.", img: "playlist6.jpeg" }
];


const imageMap = {
  "playlist1.jpeg": playlistImg1,
  "playlist2.jpeg": playlistImg2,
  "playlist.jpeg": playlistImg,
  "playlist3.jpeg": playlistImg3,
  "playlist4.jpeg": playlistImg4,
  "playlist5.jpeg": playlistImg5,
  "playlist6.jpeg": playlistImg6
};

const allPlaylists = [...playlists, ...playlists]; // duplicate list for looping
const PlaylistSection = () => {
  const [likedPlaylists, setLikedPlaylists] = useState([]);

  const toggleLike = (id) => {
    setLikedPlaylists((prevLiked) =>
      prevLiked.includes(id)
        ? prevLiked.filter((item) => item !== id)
        : [...prevLiked, id]
    );
  };

  return (
    <section className="playlist-section">
      <div className="playlist-container">
  {allPlaylists.map((playlist, index) => (
    <div key={`${playlist.id}-${index}`} className="playlist-card">
      <img
        src={imageMap[playlist.img]}
        alt={playlist.name}
        className="playlist-img"
      />
      <div className="playlist-info">
        <h3>{playlist.name}</h3>
        <p>{playlist.desc}</p>
      </div>
      <span className="heart-icon" onClick={() => toggleLike(playlist.id)}>
        {likedPlaylists.includes(playlist.id) ? (
          <FaHeart className="liked" />
        ) : (
          <FaRegHeart />
        )}
      </span>
    </div>
  ))}
</div>
    </section>
  );
};

export default PlaylistSection;
