import React, { useState, useEffect } from "react";
import "./CampusLife.css"; // make sure this file exists and is imported

const slides = {
  playground: [
    "https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
  ],
  classroom: [
    "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
  ],
  canteen: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  ],
  hostel: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
  ],
};

function CardSlider({ images }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((p) => (p + 1) % images.length);
    }, 3500);
    return () => clearInterval(t);
  }, [images.length]);

  const prev = () => setIndex((p) => (p - 1 + images.length) % images.length);
  const next = () => setIndex((p) => (p + 1) % images.length);

  return (
    <div className="card-slider">
      <button className="card-btn left" onClick={prev} aria-label="Previous">‹</button>

      <div className="card-image-wrap">
        <img src={images[index]} alt={`slide-${index}`} className="card-image" />
      </div>

      <button className="card-btn right" onClick={next} aria-label="Next">›</button>

      <div className="card-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`card-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function CampusLife() {
  return (
    <div className="campus-grid-page">
      <h1 className="grid-main-title">Campus Life</h1>

      <div className="grid-layout">
        <section className="grid-card">
          <h2 className="card-title">Playground & Sports Arena</h2>
          <p className="card-text">Large playgrounds for cricket, football, athletics and more.</p>
          <CardSlider images={slides.playground} />
        </section>

        <section className="grid-card">
          <h2 className="card-title">Modern Classrooms</h2>
          <p className="card-text">Smart, spacious, well-lit classrooms for effective learning.</p>
          <CardSlider images={slides.classroom} />
        </section>

        <section className="grid-card">
          <h2 className="card-title">Canteen & Dining</h2>
          <p className="card-text">Healthy, hygienic and tasty food options for students.</p>
          <CardSlider images={slides.canteen} />
        </section>

        <section className="grid-card">
          <h2 className="card-title">Hostel & Residential Life</h2>
          <p className="card-text">Safe, clean and comfortable hostels with study spaces.</p>
          <CardSlider images={slides.hostel} />
        </section>
      </div>
    </div>
  );
}
