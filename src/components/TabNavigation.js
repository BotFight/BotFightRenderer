import React, { useState } from 'react';
import Renderer from "./Renderer"
import MapRenderer from "./MapRenderer"

const TabNavigation = () => {
  // State to keep track of the active tab
  const [activeTab, setActiveTab] = useState(1);

  // Function to handle tab switching
  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  return (
    <Renderer/>
    
  );
};

export default TabNavigation;
