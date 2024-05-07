import React, { useState } from "react";

const ImageGeneration = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  // const generateThumbnails = async () => {
  //   try {
  //     // Load ffmpeg
  //     await loadFFmpeg();

  //     // Read the uploaded video file
  //     const videoData = new Uint8Array(await videoFile.arrayBuffer());

  //     // Run ffmpeg command to generate thumbnails
  //     await ffmpeg.FS("writeFile", "input.mp4", videoData);
  //     await ffmpeg.run(
  //       "-i",
  //       "input.mp4",
  //       "-ss",
  //       "00:00:05.5",
  //       "-frames:v",
  //       "1",
  //       "thumbnail1.jpg"
  //     );
  //     await ffmpeg.run(
  //       "-i",
  //       "input.mp4",
  //       "-ss",
  //       "00:00:10.7",
  //       "-frames:v",
  //       "1",
  //       "thumbnail2.jpg"
  //     );

  //     // Read the generated thumbnails
  //     const thumbnail1Data = await ffmpeg.FS("readFile", "thumbnail1.jpg");
  //     const thumbnail2Data = await ffmpeg.FS("readFile", "thumbnail2.jpg");

  //     // Convert thumbnails to URLs
  //     const thumbnail1Url = URL.createObjectURL(
  //       new Blob([thumbnail1Data.buffer], { type: "image/jpeg" })
  //     );
  //     const thumbnail2Url = URL.createObjectURL(
  //       new Blob([thumbnail2Data.buffer], { type: "image/jpeg" })
  //     );

  //     // Set the thumbnails in state
  //     setThumbnails([thumbnail1Url, thumbnail2Url]);
  //   } catch (error) {
  //     console.error("Error generating thumbnails:", error);
  //   }
  // };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
      <button>Generate Thumbnails</button>
      {thumbnails.length > 0 && (
        <div>
          {thumbnails.map((thumbnail, index) => (
            <img key={index} src={thumbnail} alt={`Thumbnail ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGeneration;
