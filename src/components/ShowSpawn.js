function ShowSpawn ({
    showSnakeStart, handleShowSnakeStart
  }){

  return (
    <div>
      <label className="w-50 px-2 py-0.5 rounded text-zinc-50 inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={showSnakeStart} // bind the checkbox to the state
          onChange={handleShowSnakeStart} // handle the change event
          className="h-4 w-4 mr-2" // Add margin-left here to create space after the checkbox
        />
        Show Spawn Location
      </label>
    </div>
  );
};

export default ShowSpawn;