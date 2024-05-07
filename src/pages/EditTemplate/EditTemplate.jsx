import React, { useState, useRef, useEffect, useCallback } from "react";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { FFmpeg  } from "@ffmpeg/ffmpeg";
import { toBlobURL } from '@ffmpeg/util';

const EditTemplate = () => {
  const { id } = useParams();
  const projectInput = useRef(null);
  const metadataInput = useRef(null);
  const videoInput = useRef(null);
  const thumbnailInput = useRef(null);
  
    // eslint-disable-next-line
  const messageRef = useRef(null);

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
  const [sceneUrl, setSceneUrl] = useState("");
  const [thumbFileData, setThumbFileData] = useState([]);
  const [uploadingScenes, setUploadingScenes] = useState(false);
  const [slideFrames, setSlideFrames] = useState([]);
  const [radioButton, setRadioButton] = useState('landscape');
    // eslint-disable-next-line
  const [loaded, setLoaded] = useState(false);
  // eslint-disable-next-line
  const [metadataObj, setMetadataObj] = useState([]);
  // eslint-disable-next-line
  const [slides, setSlides] = useState();
  const [docRef, setDocRef] = useState(null);


  const ffmpegRef = useRef(new FFmpeg());

  const handleOptionClick = (value) => {
    setRadioButton(value);
  };
 
  const isFile = (value) => {
    return value instanceof File;
  };

  const fetchTemplate = useCallback( async() => {
    const docRef = doc(db, "templates", id);
    setDocRef(docRef);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let fetchedMetadata = docSnap.data();
      setMetadata(fetchedMetadata);
      setName(fetchedMetadata.name);
      setCategory(fetchedMetadata.category);
      setRadioButton(fetchedMetadata.orientation);
      setSlideFrames(fetchedMetadata.slide_frames ? JSON.parse(fetchedMetadata.slide_frames) : {});
      setMetadataObj(JSON.parse(fetchedMetadata.metadata));
      setSlides(JSON.parse(fetchedMetadata.slides));

    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  }, [id])
  
  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate, id])

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
        console.log(message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setLoaded(true);
}


  let tempThumbnailData = [];
  let fileUrls = {
    projectFileUrl: "",
    videoFileUrl: "",
    thumbnailFileUrl: "",
  };

  const generateThumbnails = async () => {
    setGeneratingScenes(true);
    try {
      await load()

      // Read the uploaded video file
      const videoData = new Uint8Array(await sampleVideoFile.arrayBuffer());
      const ffmpeg = ffmpegRef.current;

      // Run ffmpeg command to generate thumbnails
      await ffmpeg.writeFile("input.mp4", videoData);

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
        console.log("loading scenes", scenesTemp.scenes[index]);
        const scene = scenesTemp.scenes[index];
        try {
          await ffmpeg.exec([
            "-i",
            "input.mp4",
            "-ss",
            convertTimeFormat(scene.start_time),
            "-frames:v",
            "1",
            "-vf",
            "scale=600:-1",
            `${scene.name}.jpg`
          ]);

          const thumbnailData = await ffmpeg.readFile(
            `${scene.name}.jpg`
          );

          setThumbFileData((prevState) => [...prevState, thumbFileData]);
          console.log("thumb file data", thumbFileData);

          const thumbUrl = URL.createObjectURL(
            new Blob([thumbnailData.buffer], { type: "image/jpeg" })
          );
          tempThumbnailData.push({
            scene_name: scene.name,
            slide: scene.name + ".jpg",
            url: thumbUrl,
          });
          setThumbnails((prevState) => [...prevState, thumbUrl]);
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

      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      console.log("getDownloadURLgetDownloadURLgetDownloadURL", url);
      if (fileUrl) {
        fileUrls[fileUrl] = url;
      }
      setFileUrl(url);
    } catch (error) {
      setUploadingFiles(false);
      console.error("Error uploading file: ", error);
    }
  };

  // eslint-disable-next-line
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
    setRadioButton('landscape')
    fileUrls = {
      projectFileUrl: "",
      videoFileUrl: "",
      thumbnailFileUrl: "",
    };
  };

  useEffect(() => {
    console.log(sceneUrl);
  }, [sceneUrl]);

  useEffect(() => {
    if (
      !name ||
      invalidMetaFile
    ) {
      setDisableUpload(true);
    } else {
      setDisableUpload(false);
    }
  }, [name, invalidMetaFile]);

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
          setName(metaTemp.name ? metaTemp.name : "");
          setCategory(metaTemp.category ? metaTemp.category : "");
          setDescription(metaTemp.description ? metaTemp.description : "");
          metaTemp.scenes.map((scene) => {
            let matchingImages = metaTemp.image_sizes.filter((image) => {
              image.aspect_ratio = image.width / image.height;
              image.width = 0.3;
              image.height = 0;
              return image.name.includes(`photo-${scene.sceneIndex}`);
            });
            let matchingText = metaTemp.text.filter((t) =>
              t.layer_name.includes(`text-${scene.sceneIndex}`)
            );

            setSlideFrames((prevState) => [
              ...prevState,
              {
                name: scene.name,
                photo_frames: matchingImages,
                text_frames: matchingText,
              },
            ]);
            return true;
          });
          setMetadata(data);
        } catch (error) {
          console.error("Error parsing JSON file: ", error);
        }
      };
      reader.readAsText(metaDataFile);
    }
  }, [metaDataFile]);

  const uploadTemplate = async () => {
    if (disableUpload) {
      setShowRequiredError(true);
      return;
    }

    setLoading(true);
    let newDocRef = docRef;
    setUploadingData(true);
    try {
      const storageRef = ref(storage, newDocRef.id);
      setUploadingFiles(true);
      // Upload project file
      console.log("projectFileprojectFileprojectFile",projectFile)
      if (projectFile && isFile(projectFile)) {
        await uploadFile(
          storageRef,
          projectFile,
          setProjectFileUrl,
          "projectFileUrl"
        );
      }
      if (sampleVideoFile && isFile(sampleVideoFile)) {
        await uploadFile(
          storageRef,
          sampleVideoFile,
          setSampleVideoFileUrl,
          "videoFileUrl"
        );
      }
      if (thumbnailFile && isFile(thumbnailFile)) {
        console.log("thumbnailFilethumbnailFilethumbnailFile",thumbnailFile)
        await uploadFile(
          storageRef,
          thumbnailFile,
          setThumbnailFileUrl,
          "thumbnailFileUrl"
        );
      }
      setUploadingFiles(false);
      // Upload metadata file
      //   if (metaDataFile) {
      //     await uploadFile(metaDataFile, setMetaDataFileUrl);
      //   }

      if (isFile(thumbnailFile) || isFile(sampleVideoFile)) {
        await generateThumbnails();

        setUploadingScenes(true);
        for (let index = 0; index < tempThumbnailData.length; index++) {
          const imageBlob = await fetch(tempThumbnailData[index].url).then(
            (response) => response.blob()
          );

          try {
            const fileRef = ref(
              storageRef,
              "scenes/" + tempThumbnailData[index].scene_name + ".jpg"
            );

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
        setThumbnails([]);

        setUploadingScenes(false);
      }
      console.log(projectFileUrl, sampleVideoFileUrl, thumbnailFileurl);

      console.log('metadatametadatametadata', metadata)
      let metadataClone = JSON.parse(metadata.metadata);
      metadataClone.name = name;
      metadataClone.description = description;
      metadataClone.category = category;

      let myDocumentData = {
        description: description,
        metadata: JSON.stringify(metadataClone),
        name: name,
        category: category,
        orientation:radioButton,
        slide_frames: JSON.stringify(slideFrames),
        slides: JSON.stringify({
          slide_uploads: tempThumbnailData,
        }),
      };

      if (fileUrls.projectFileUrl) {
        myDocumentData.project_file = fileUrls.projectFileUrl
      }
      
      if (fileUrls.videoFileUrl) {
        myDocumentData.sample_video_url = fileUrls.videoFileUrl
      }
      
      if (fileUrls.thumbnailFileUrl) {
        myDocumentData.thumbnail_url = fileUrls.thumbnailFileUrl
      }

      await updateDoc(newDocRef, myDocumentData)
        .then(() => {
          setLoading(false);
          tempThumbnailData = [];
        })
        .catch((error) => {
          console.log("Error setting the doc" + error);
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
      <h1 className="text-black text-2xl mb-10 font-semibold">
        Edit Template
      </h1>
      {thumbnails.length > 0 && (
        <div className="flex gap-2 items-center">
          {thumbnails.map((thumbnail, index) => (
            <img
              className="w-24"
              key={index}
              src={thumbnail}
              alt={`Thumbnail ${index + 1}`}
            />
          ))}
        </div>
      )}
      <div className="px-5 w-full mb-7 relative grid grid-cols-2 gap-4">
        {showRequiredError ? (
          <span className="text-red-500 col-span-2">
            Please fill the required fields.
          </span>
        ) : (
          ""
        )}
        {invalidMetaFile ? (
          <span className="text-red-500 col-span-2">
            Metadata file is invalid. Please select valid metadata file.
          </span>
        ) : (
          ""
        )}
        {loading ? (
          <div className="loading-overlay bg-white/80 left-0 top-0 absolute h-full w-full z-10 flex items-center justify-center flex-col">
            <img src={"/images/loading.svg"} alt="Loading" className="h-20" />
            {uploadingFiles ? (
              <span className="text-gray-800">Uploading Files...</span>
            ) : (
              ""
            )}
            {uploadingData ? (
              <span className="text-gray-800">Saving Data...</span>
            ) : (
              ""
            )}
            {generatingScenes ? (
              <span className="text-gray-800">Generating scenes...</span>
            ) : (
              ""
            )}
            {uploadingScenes ? (
              <span className="text-gray-800">Uploading scenes...</span>
            ) : (
              ""
            )}
          </div>
        ) : (
          ""
        )}

        <div className="pb-5">
          <label
            htmlFor="project-name"
            className="w-full pb-1.5 block text-base text-[#8e8e8e]"
          >
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
          <label
            htmlFor="project-categrory"
            className="w-full pb-1.5 block text-base text-[#8e8e8e]"
          >
            Project Categrory
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] p-3 rounded-lg text-base  outline-none appearance-none bg-no-repeat bg-[right_1rem_top_50%]"
          >
            <option value="categrory">Choose categrory </option>
            <option value="candy">Candy</option>
            <option value="birthday">Birthday</option>
          </select>
        </div>
        <div className="pb-5">
          <label
            htmlFor="project-file"
            className="w-full pb-1.5 block text-base text-[#8e8e8e]"
          >
            Project file
          </label>
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  outline-none flex items-center relative">
            <div className="rounded-l-lg bg-[#bfbfbf] inline-block py-2 px-3 text-black">
              Choose File
            </div>
            <div className="py-2 px-3">
            {
                projectFile ? projectFile.name : (
                  <>
                    {metadata.project_file_name ? metadata.project_file_name : "No file selected"}
                  </>
                )
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
          <label
            htmlFor="metadata-file"
            className="w-full pb-1.5 block text-base text-[#8e8e8e]"
          >
            Metadata File
          </label>
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  outline-none flex items-center relative">
            <div className="rounded-l-lg bg-[#bfbfbf] inline-block py-2 px-3 text-black">
              Choose File
            </div>
            <div className="py-2 px-3">
            {
                metaDataFile ? metaDataFile.name : (
                  <>
                    {metadata.metadata_name ? metadata.metadata_name : "No file selected"}
                  </>
                )
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
          <label
            htmlFor="sample-video"
            className="w-full pb-1.5 block text-base text-[#8e8e8e]"
          >
            Sample Video
          </label>
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  outline-none flex items-center relative">
            <div className="rounded-l-lg bg-[#bfbfbf] inline-block py-2 px-3 text-black">
              Choose File
            </div>
            <div className="py-2 px-3">
              {
                sampleVideoFile ? sampleVideoFile.name : (
                  <>
                    {metadata.sample_video_name ? metadata.sample_video_name : "No file selected"}
                  </>
                )
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
          <label
            htmlFor="Thumbnail"
            className="w-full pb-1.5 block text-base text-[#8e8e8e]"
          >
            Thumbnail
          </label>
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  outline-none flex items-center relative">
            <div className="rounded-l-lg bg-[#bfbfbf] inline-block py-2 px-3 text-black">
              Choose File
            </div>
            <div className="py-2 px-3">
            {
                thumbnailFile ? thumbnailFile.name : (
                  <>
                    {metadata.thumbnail_name ? metadata.thumbnail_name : "No file selected"}
                  </>
                )
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
        <div>
          <label
            htmlFor="sample-video"
            className="w-full pb-1.5 block text-base text-[#8e8e8e]"
          >
            Choose Orientation
          </label>
          <div className="flex">
            <div className={radioButton === 'portrait' ? 'selected' : 'cursor-pointer'} onClick={() => handleOptionClick('portrait')}>
              <svg fill={radioButton === 'portrait' ? '#10b981' : '#dedede'} width="36px" height="36px" viewBox="0 0 36 36" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <title>portrait-solid</title>
                <path d="M28,2H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V4A2,2,0,0,0,28,2ZM20.52,26.3a1,1,0,0,1,1.36,1.47L18,31.36l-3.88-3.59a1,1,0,0,1,1.36-1.47L17,27.71V8.29L15.48,9.7a1,1,0,0,1-1.36-1.47L18,4.64l3.88,3.59a1,1,0,0,1,.05,1.41,1,1,0,0,1-.73.32,1,1,0,0,1-.68-.26L19,8.29V27.71Z" class="clr-i-solid clr-i-solid-path-1"></path>
                <rect x="0" y="0" width="36" height="36" fill-opacity="0" />
              </svg>
            </div>
            <div className={radioButton === 'landscape' ? 'selected' : 'cursor-pointer'} onClick={() => handleOptionClick('landscape')}>
              <svg fill={radioButton === 'landscape' ? '#10b981' : '#dedede'} width="36px" height="36px" viewBox="0 0 36 36" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <title>landscape-solid</title>
                <path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM27.77,21.88a1,1,0,0,1-.73.32,1,1,0,0,1-.68-.27,1,1,0,0,1-.06-1.41L27.71,19H8.29L9.7,20.52a1,1,0,0,1-.06,1.41A1,1,0,0,1,9,22.2a1,1,0,0,1-.73-.32L4.64,18l3.59-3.88A1,1,0,0,1,9.7,15.48L8.29,17H27.71L26.3,15.48a1,1,0,0,1,1.47-1.36L31.36,18Z" class="clr-i-solid clr-i-solid-path-1"></path>
                <rect x="0" y="0" width="36" height="36" fill-opacity="0" />
              </svg>
            </div>
          </div>
        </div>
        <div className="pb-5 col-span-2">
          <label
            htmlFor="Description"
            className="w-full pb-1.5 block text-base text-[#8e8e8e]"
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write Description Here..."
            className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base  resize-none outline-none flex items-center relative p-3"
            rows={4}
          ></textarea>
        </div>
        <div className="text-end col-span-2">
          <button
            disabled={disableUpload}
            onClick={uploadTemplate}
            className={`p-2 px-3 bg-emerald-400 rounded-lg text-semibold text-gray-800 text-center text-sm ${disableUpload ? "opacity-50" : ""
              }`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTemplate;
