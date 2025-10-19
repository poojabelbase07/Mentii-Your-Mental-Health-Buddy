// CardLayout.jsx
import React from "react";
import Card from "./Card";
import "./Card.css"; // Optional if you need styling

const CardLayout = () => {
  return (
    <div className="card-layout">
      <h2 className="page-title">5 Tools — One Platform</h2>
      <div className="card-container">
        <Card
          title="Audio Zone"
          description="Let the soothing sounds and guided meditations relax your mind."
          link="/calm/audio"
        />
        <Card
          title="Video Zone"
          description="Watch uplifting videos, TED Talks, and animated stories."
          link="/calm/video"
        />
        <Card
          title="Game Zone"
          description="Relax and recharge with mindful and stress-free games."
          link="/calm/game"
        />
        <Card
          title="Book Zone"
          description="Words have power! Discover inspiring stories and self-help guides."
          link="/calm/book"
        />
        <Card
          title="Podcast Zone"
          description="Hearing the right words at the right time can make all the difference."
          link="/calm/podcast"
        />
        <Card
          title="Spiritual Zone"
          description="A space to connect with your deeper self."
          link="/calm/spiritual"
        />
      </div>
    </div>
  );
};

export default CardLayout;
