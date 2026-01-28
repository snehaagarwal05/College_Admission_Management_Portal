import React, { useEffect, useState } from "react";
import "./IntroLoader.css";

import books from "../../assets/books.png";
import globe from "../../assets/globe.png";
import flask from "../../assets/flask.png";

const images = [books, globe, flask];

const IntroLoader = ({ onFinish }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev === images.length - 1) {
          clearInterval(interval);
          setTimeout(onFinish, 700);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="intro-loader">
      <img
        src={images[index]}
        alt="Loading"
        className="loader-image"
      />
      <p className="loader-text">Loading...</p>
    </div>
  );
};

export default IntroLoader;

