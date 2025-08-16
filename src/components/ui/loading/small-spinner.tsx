import React from 'react';
import './styles.css'

const LoadingSpinner = () => {

  return (
<div className="loader h-full">
    <span className="bar"></span>
    <span className="bar"></span>
    <span className="bar"></span>
</div>
  );
};

export default LoadingSpinner;