import React from "react";
import "./loader.css";

const LoadingText = () => {
  return (
    <div className=" w-full h-full flex-1 flex items-center justify-center">
        <div data-glitch="Loading..." className="glitch">
          Loading...
        </div>
    </div>
  );
};

export default LoadingText;
