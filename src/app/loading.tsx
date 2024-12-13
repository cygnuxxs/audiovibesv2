import React from "react";
import "./loader.css";

const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="loader">
        <div className="box">
          <div className="logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              width="200"
              height="200"
            >
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="black"
                stroke="#3b82f6"
                strokeWidth="10"
              />

              <polygon points="80,140 100,60 120,140" fill="white" />
              <rect x="93" y="110" width="14" height="30" fill="black" />

              <path
                d="M125,60 L145,140 L165,60"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M130,90 Q140,80 150,90 Q160,100 150,110 Q140,120 130,110"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />

              <path
                d="M40,170 Q50,160 60,170 T80,170 T100,170 T120,170 T140,170 T160,170"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
              />
            </svg>
          </div>
        </div>
        <div className="box"></div>
        <div className="box"></div>
        <div className="box"></div>
        <div className="box"></div>
      </div>
    </div>
  );
};

export default Loading;
