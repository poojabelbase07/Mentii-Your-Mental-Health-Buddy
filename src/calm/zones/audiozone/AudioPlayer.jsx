import React, { useRef, useState, useEffect } from "react";
import "./AudioPlayer.css";
import song1 from "../../../../src/assets/";
import song2 from "../../assets/song2.mp3";
import song3 from "../../assets/song3.mp3";
import songImg from "../../assets/song1.jpeg";



const songs = [
  { title: "Peaceful Mind", artist: "Relax Beats", src: song1, img: songImg },
  { title: "Deep Focus", artist: "Study Crew", src: song2, img: songImg },
  { title: "Night Breeze", artist: "Dreamy Vibes", src: song3, img: songImg }
];

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent || 0);
    };

    if (isPlaying) audio.play();
    else audio.pause();

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [isPlaying, currentSongIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setProgress(0);
    setIsPlaying(true);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
    setProgress(0);
    setIsPlaying(true);
  };

  const seek = (e) => {
    const audio = audioRef.current;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  return (
    <div className="audio-player">
      <div className="song-infoo">
        <img src={currentSong.img} alt="Album" className="album-art" />
        <div className="song-details">
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist}</p>
        </div>
      </div>

      <div className="controls">
        <button onClick={prevSong}>⏮️</button>
        <button onClick={togglePlay}>{isPlaying ? "⏸️" : "▶️"}</button>
        <button onClick={nextSong}>⏭️</button>
      </div>

      <div className="progress-bar" ref={progressRef} onClick={seek}>
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>

      <audio ref={audioRef} src={currentSong.src} />
    </div>
  );
};

export default AudioPlayer;
