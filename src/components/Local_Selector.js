import React, { useState } from 'react'

export default function Local_Selector() {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    }
  return (
    <div>
        <input type="file" onChange={handleFileChange} />
        {selectedFile && <p>{selectedFile.name}</p>}
    </div>
  )
}
