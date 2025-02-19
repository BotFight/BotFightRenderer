import React, { useState } from 'react';
import LocalRenderer from './LocalRenderer';
import MapRenderer from './MapRenderer'

function TabSwitcher() {
  const [activeTab, setActiveTab] = useState(0);  // State to track active tab

  const handleTabClick = (index) => {
    setActiveTab(index);  // Change the active tab when clicked
  };

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        {/* Tab Buttons */}
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => handleTabClick(0)}
        >
          Match Player
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 1 ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => handleTabClick(1)}
        >
          Map Builder
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 2 ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => handleTabClick(2)}
        >
          Match Replayer
        </button>
      </div>

      <div>
        {/* Tab Content */}
        {activeTab === 0 && (
          <div className="tab-pane">
            <LocalRenderer/>
          </div>
        )}
        {activeTab === 1 && (
          <div className="tab-pane">
            <MapRenderer/>
          </div>
        )}
        {activeTab === 2 && (
          <div className="tab-pane">
            <h2 className="text-xl font-semibold">Tab 3 Content</h2>
            <p>This is the content for Tab 3.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TabSwitcher;
