function MapSettings({
  mapHeight, handleHeightChange,
  mapWidth, handleWidthChange,
  appleRate, handleAppleRateChange,
  appleNum, handleAppleNumChange,
  startSize, handleStartSizeChange
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-lg font-bold text-zinc-50">Map Settings</p>
      <div className="flex flex-row gap-2 items-center justify-end w-full">
        <label htmlFor="mapHeight" className="block text-zinc-300">Map Height</label>
        <input
          id="mapHeight"
          type="number"
          value={mapHeight}
          onChange={handleHeightChange}
          className="nav-input px-2 py-1 border rounded max-w-24"
          placeholder="Map Height"
        />
      </div>

      <div className="flex flex-row gap-2 items-center justify-end w-full">
        <label htmlFor="mapWidth" className="block text-zinc-300">Map Width</label>
        <input
          id="mapWidth"
          type="number"
          value={mapWidth}
          onChange={handleWidthChange}
          className="nav-input px-2 py-1 border rounded max-w-24"
          placeholder="Map Width"
        />
      </div>

      <div className="flex flex-row gap-2 items-center justify-end w-full">
        <label htmlFor="appleRate" className="block text-zinc-300">Apple Spawn Rate</label>
        <input
          id="appleRate"
          type="number"
          value={appleRate}
          onChange={handleAppleRateChange}
          className="nav-input px-2 py-1 border rounded max-w-24"
          placeholder="Apple Spawn Rate"
        />
      </div>

      <div className="flex flex-row gap-2 items-center justify-end w-full">
        <label htmlFor="appleNum" className="block text-zinc-300">Apple Spawn Count</label>
        <input
          id="appleNum"
          type="number"
          value={appleNum}
          onChange={handleAppleNumChange}
          className="nav-input px-2 py-1 border rounded max-w-24"
          placeholder="Apple Spawn #"
        />
      </div>

      <div className="flex flex-row gap-2 items-center justify-end w-full">
        <label htmlFor="startSize" className="block text-zinc-300">Snake Start Size</label>
        <input
          id="startSize"
          type="number"
          value={startSize}
          onChange={handleStartSizeChange}
          className="nav-input px-2 py-1 border rounded max-w-24"
          placeholder="Start Size"
        />
      </div>
    </div>
  );
}

export default MapSettings;
