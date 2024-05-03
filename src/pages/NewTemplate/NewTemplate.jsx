import React, { useState, useRef, useEffect } from "react";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, setDoc, deleteDoc  } from "firebase/firestore";
import { createFFmpeg } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  log: true,
});

const NewTemplate = () => {
    const projectInput = useRef(null);
    const metadataInput = useRef(null);
    const videoInput = useRef(null);
    const thumbnailInput = useRef(null);

    const [projectFile, setProjectFile] = useState(null);
    const [metaDataFile, setMetaDataFile] = useState(null);
    const [sampleVideoFile, setSampleVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [projectFileUrl, setProjectFileUrl] = useState("");
    const [sampleVideoFileUrl, setSampleVideoFileUrl] = useState("");
    const [thumbnailFileurl, setThumbnailFileUrl] = useState("");
    const [metadata, setMetadata] = useState("");
    const [loading, setLoading] = useState(false);
    const [thumbnails, setThumbnails] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [invalidMetaFile, setInvalidMetaFile] = useState(false);
  const [disableUpload, setDisableUpload] = useState(false);
  const [showRequiredError, setShowRequiredError] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadingData, setUploadingData] = useState(false);
  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [sceneUrl, setSceneUrl] = useState('');
  const [thumbFileData, setThumbFileData] = useState([]);
  const [uploadingScenes, setUploadingScenes] = useState(false);
  const [slideFrames, setSlideFrames] = useState([]);

  const loadFFmpeg = async () => {
    await ffmpeg.load();
  };

  let tempThumbnailData = [];
  let fileUrls = {
    projectFileUrl: "",
    videoFileUrl: "",
    thumbnailFileUrl: ""
  }

  const generateThumbnails = async () => {
    setGeneratingScenes(true);
    try {
      // Load ffmpeg
      if(!ffmpeg.isLoaded()) {
        await loadFFmpeg();

      }

      // Read the uploaded video file
      const videoData = new Uint8Array(await sampleVideoFile.arrayBuffer());

      // Run ffmpeg command to generate thumbnails
      await ffmpeg.FS("writeFile", "input.mp4", videoData);

      function convertTimeFormat(time) {
        // Split the time string into seconds and milliseconds
        const [seconds, milliseconds] = time.toString().split(".");
      
        // Convert seconds to HH:MM:SS format
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
      
        // Format hours, minutes, and seconds with leading zeros if necessary
        const formattedHours = hours.toString().padStart(2, "0");
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
      
        // Concatenate hours, minutes, seconds, and milliseconds
        const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${milliseconds}`;
      
        return formattedTime;
      }

      const scenesTemp = JSON.parse(metadata);
      
      for (let index = 0; index < scenesTemp.scenes.length; index++) {
        console.log('loading scenes',  scenesTemp.scenes[index])
        const scene = scenesTemp.scenes[index];
        try {
          await ffmpeg.run(
            "-i",
            "input.mp4",
            "-ss",
            convertTimeFormat(scene.start_time),
            "-frames:v",
            "1",
            "-vf",
            "scale=600:-1",
            `${scene.name}.jpg`
          );
      
          const thumbnailData = await ffmpeg.FS("readFile", `${scene.name}.jpg`);

          setThumbFileData((prevState) => [...prevState, thumbFileData]);
          console.log("thumb file data",thumbFileData)

           const thumbUrl = URL.createObjectURL(
            new Blob([thumbnailData.buffer], { type: "image/jpeg" })
          )
          tempThumbnailData.push({
            scene_name: scene.name,
            slide: scene.name + '.jpg',
            url: thumbUrl})
          setThumbnails((prevState) => [...prevState, thumbUrl])
          setGeneratingScenes(false);
        } catch (error) {
          setGeneratingScenes(false);
          console.error(`Error processing thumbnail ${index}:`, error);
        }
      }

    } catch (error) {
      setGeneratingScenes(false);
      console.error("Error generating thumbnails:", error);
    }
  };

   const uploadFile = async (storageRef, file, setFileUrl, fileUrl) => {
    try {
        const fileRef = ref(storageRef, file.name);

      await uploadBytes(fileRef, file.name);
      const url = await getDownloadURL(fileRef);
      console.log(setFileUrl, url)
      if (fileUrl) {
        fileUrls[fileUrl] = url
      }
      setFileUrl(url);
    } catch (error) {
      setUploadingFiles(false);
      console.error("Error uploading file: ", error);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setProjectFile(null);
    setMetaDataFile(null);
    setSampleVideoFile(null);
    setThumbnailFile(null);
    setProjectFileUrl("");
    setSampleVideoFileUrl("");
    setThumbnailFileUrl("");
    setMetadata("");
    setDescription("");
    setLoading(false);
    projectInput.current.value = "";
    metadataInput.current.value = "";
    videoInput.current.value = "";
    thumbnailInput.current.value = "";
    setInvalidMetaFile(false);
    setDisableUpload(false);
    setUploadingData(false);
    setUploadingData(false);
    setGeneratingScenes(false);
  };

  useEffect(() => {
    console.log(sceneUrl)
  }, [sceneUrl])

  useEffect(() => {
    if (!projectFile || !sampleVideoFile || !name || !thumbnailFile || invalidMetaFile) {
      setDisableUpload(true);
    } else {
      setDisableUpload(false);
    }
  }, [projectFile, sampleVideoFile, name, thumbnailFile, invalidMetaFile])

  useEffect(() => {    
        if (metaDataFile) {
          const reader = new FileReader();
        reader.onload = (event) => {
        try {
            const data = event.target.result;
            let metaTemp = JSON.parse(data);
            if (!metaTemp.scenes || !metaTemp.image_sizes || !metaTemp.text) {
              setInvalidMetaFile(true);
            } else {
              setInvalidMetaFile(false);
            }
            setName(metaTemp.name ? metaTemp.name : '');
            setCategory(metaTemp.category ? metaTemp.category : '');
            setDescription(metaTemp.description ? metaTemp.description : '');
            metaTemp.scenes.map((scene) => {
              console.log('mappedScene', scene)
              let matchingImages = metaTemp.image_sizes.filter((image) =>
                {
                  image.aspect_ratio = image.width/image.height;
                  image.width = 0.3;
                  image.height = 0;
                  return image.name.includes(`photo-${scene.sceneIndex}`)
                }
              );
              let matchingText = metaTemp.text.filter((t) =>
                t.layer_name.includes(`text-${scene.sceneIndex}`)
              );
              console.log('mappedSceneIMages', matchingImages, matchingText)

              setSlideFrames((prevState) => [...prevState, {
                name: scene.name,
                photo_frames: matchingImages,
                text_frames: matchingText
              }])
            })
            setMetadata(data);
        } catch (error) {
            console.error("Error parsing JSON file: ", error);
        }
        };
          reader.readAsText(metaDataFile);
        }
  }, [metaDataFile])

  const uploadTemplate = async () => {    
    if (disableUpload) {
      setShowRequiredError(true);
      return
    }      

    setLoading(true);
    let newDocRef;
    setUploadingData(true);
    try {
      const templatesRef = collection(db, "templates");
      let myDocumentData = {
        name: name,
        category: category,
      };

      // Add the document to the collection
      newDocRef = await addDoc(templatesRef, myDocumentData);

      const storageRef = ref(storage, newDocRef.id);
      setUploadingFiles(true);
       // Upload project file
       if (projectFile) {
        await uploadFile(storageRef, projectFile, setProjectFileUrl, "projectFileUrl");
      }
      if (sampleVideoFile) {
        await uploadFile(storageRef, sampleVideoFile, setSampleVideoFileUrl, "videoFileUrl");
      }
      if (thumbnailFile) {
        await uploadFile(storageRef, thumbnailFile, setThumbnailFileUrl, "thumbnailFileUrl");
      }
      setUploadingFiles(false);
      // Upload metadata file
    //   if (metaDataFile) {
    //     await uploadFile(metaDataFile, setMetaDataFileUrl);
    //   }

      await generateThumbnails();

      setUploadingScenes(true);
      for (let index = 0; index < tempThumbnailData.length; index++) {
        console.log('thumbdataarray', tempThumbnailData)
        const imageBlob = await fetch(tempThumbnailData[index].url).then(response => response.blob());

        try {
          const fileRef = ref(storageRef, 'scenes/'+ tempThumbnailData[index].scene_name + ".jpg");
  
        await uploadBytes(fileRef, imageBlob);
        const url = await getDownloadURL(fileRef);
        tempThumbnailData[index].url = url;
        setSceneUrl(url);
      } catch (error) {
        setUploadingScenes(false);
        setUploadingFiles(false);
        console.error("Error uploading file: ", error);
      }
      }
      setThumbnails([])
      
      setUploadingScenes(false);

      myDocumentData = {
        ...myDocumentData,
        description: description,
        metadata: metadata,
        slide_frames: JSON.stringify(slideFrames),
        slides: JSON.stringify({
          slide_uploads: tempThumbnailData
        }),
        project_file: fileUrls.projectFileUrl,
        sample_video_url: fileUrls.videoFileUrl,
        thumbnail_url: fileUrls.thumbnailFileUrl,
      };
      await setDoc(newDocRef, myDocumentData).then(() => {
        setLoading(false);
        resetForm();
        tempThumbnailData = [];
      }).catch((error) => {
        console.log("Error setting the doc" + error)
      });
    } catch (error) {
        await deleteDoc(newDocRef);
        setLoading(false);
        setUploadingData(false);
        setGeneratingScenes(false);
        setUploadingFiles(false);
        console.error("Error uploading files and saving data: ", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-black text-2xl mb-10 font-semibold">Upload New Template</h1>
      {thumbnails.length > 0 && (
        <div className="flex gap-2 items-center">
          {thumbnails.map((thumbnail, index) => (
            <img className="w-24" key={index} src={thumbnail} alt={`Thumbnail ${index + 1}`} />
          ))}
        </div>
      )}
      <div className="px-5 w-full mb-7 relative grid grid-cols-2 gap-4">
        {
          showRequiredError ? (
            <span className="text-red-500 col-span-2">Please fill the required fields.</span>
          ) : ''
        }
        {
          invalidMetaFile ? (
            <span className="text-red-500 col-span-2">Metadata file is invalid. Please select valid metadata file.</span>
          ) : ''
        }
        {
            loading ? (
                <div className="loading-overlay bg-white/80 left-0 top-0 absolute h-full w-full z-10 flex items-center justify-center flex-col">
                    <img src={'/images/loading.svg'} alt="Loading" className="h-20" />
                    {
                    uploadingFiles ? 
                    <span className="text-gray-800">Uploading Files...</span>
                  : ''}
                  {
                    uploadingData ? 
                    <span className="text-gray-800">Saving Data...</span>
                    : ''
                  }
                  {
                    generatingScenes ? 
                    <span className="text-gray-800">Generating scenes...</span>
                    : ''
                  }
                  {
                    uploadingScenes ? 
                    <span className="text-gray-800">Uploading scenes...</span>
                    : ''
                  }
                </div>
            ) : ""
        }
        
        <div className="pb-5">
          <label htmlFor="project-name" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Project Name"
            className="w-full border border-solid border-[#e3e3e3] bg-[#f9f9f9] p-3 rounded-lg text-base  outline-none"
          />
        </div>
        <div className="pb-5">
          <label htmlFor="project-categrory" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Project Categrory
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] p-3 rounded-lg text-base  outline-none appearance-none bg-no-repeat bg-[right_1rem_top_50%]">
            <option value="categrory">Choose categrory </option>
            <option value="categrory1">categrory 1</option>
            <option value="categrory2">categrory 2</option>
            <option value="categrory3">categrory 3</option>
          </select>
        </div>
        <div className="pb-5">
          <label htmlFor="project-file" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Project file
          </label>
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  outline-none flex items-center relative">
            <div className="rounded-l-lg bg-[#bfbfbf] inline-block py-2 px-3 text-black">Choose File</div>
            <div className="py-2 px-3">
            {
                    projectFile ? projectFile.name : 'No file selected'
                }
            </div>
            <input
            required
            accept=".zip"
            ref={projectInput}
              type="file"
              name="chooseFile"
              onChange={(e) => setProjectFile(e.target.files[0])}
              className="absolute opacity-0 w-full h-full"
            />
          </div>
        </div>
        <div className="pb-5">
          <label htmlFor="metadata-file" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Metadata File
          </label>
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  outline-none flex items-center relative">
            <div className="rounded-l-lg bg-[#bfbfbf] inline-block py-2 px-3 text-black">Choose File</div>
            <div className="py-2 px-3">
                {
                    metaDataFile ? metaDataFile.name : 'No file selected'
                }
            </div>
            <input
            required
              type="file"
            accept=".json"
            ref={metadataInput}
              name="chooseFile"
              onChange={(e) => setMetaDataFile(e.target.files[0])}
              className="absolute opacity-0 w-full h-full"
            />
          </div>
        </div>
        <div className="pb-5">
          <label htmlFor="sample-video" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Sample Video
          </label>
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  outline-none flex items-center relative">
            <div className="rounded-l-lg bg-[#bfbfbf] inline-block py-2 px-3 text-black">Choose File</div>
            <div className="py-2 px-3">
            {
                    sampleVideoFile ? sampleVideoFile.name : 'No file selected'
                }
            </div>
            <input
                required
              type="file"
            accept=".mp4"
            ref={videoInput}
              name="chooseFile"
              onChange={(e) => setSampleVideoFile(e.target.files[0])}
              className="absolute opacity-0 w-full h-full"
            />
          </div>
        </div>
        <div className="pb-5">
          <label htmlFor="Thumbnail" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Thumbnail
          </label>
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  outline-none flex items-center relative">
            <div className="rounded-l-lg bg-[#bfbfbf] inline-block py-2 px-3 text-black">Choose File</div>
            <div className="py-2 px-3">
            {
                    thumbnailFile ? thumbnailFile.name : 'No file selected'
                }
            </div>
            <input
            required
              type="file"
              name="chooseFile"
            ref={thumbnailInput}
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="absolute opacity-0 w-full h-full"
            />
          </div>
        </div>
        <div className="pb-5 col-span-2">
          <label htmlFor="Description" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Description
          </label>
          <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
            placeholder="Write Description Here..."
            className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  resize-none outline-none flex items-center relative p-3"
            rows={4}
          ></textarea>
        </div>
        <div className="text-end col-span-2">
          <button
            disabled={disableUpload}
            onClick={uploadTemplate}
            className={`p-2 px-3 bg-emerald-400 rounded-lg text-semibold text-gray-800 text-center text-sm ${disableUpload ? 'opacity-50' : ''}`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTemplate;
