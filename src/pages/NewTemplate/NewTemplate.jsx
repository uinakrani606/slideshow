import React, { useState, useRef } from "react";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, setDoc, deleteDoc  } from "firebase/firestore";

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

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

   const uploadFile = async (storageRef, file, setFileUrl) => {
    try {
        const fileRef = ref(storageRef, file.name);

      await uploadBytes(fileRef, file.name);
      const url = await getDownloadURL(fileRef);
      console.log(url)
      setFileUrl(url);
    } catch (error) {
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
    setLoading(false);
    projectInput.current.value = "";
    metadataInput.current.value = "";
    videoInput.current.value = "";
    thumbnailInput.current.value = "";
  };

  const uploadTemplate = async () => {
    setLoading(true);
    let newDocRef;
    try {
      const templatesRef = collection(db, "templates");
      let myDocumentData = {
        name: name,
        category: category,
      };

      // Add the document to the collection
      newDocRef = await addDoc(templatesRef, myDocumentData);

      const storageRef = ref(storage, newDocRef.id);
       // Upload project file
       if (projectFile) {
        await uploadFile(storageRef, projectFile, setProjectFileUrl);
      }
      if (sampleVideoFile) {
        await uploadFile(storageRef, sampleVideoFile, setSampleVideoFileUrl);
      }
      if (thumbnailFile) {
        await uploadFile(storageRef, thumbnailFile, setThumbnailFileUrl);
      }
      // Upload metadata file
    //   if (metaDataFile) {
    //     await uploadFile(metaDataFile, setMetaDataFileUrl);
    //   }

      const reader = new FileReader();
        reader.onload = (event) => {
        try {
            const data = event.target.result;
            setMetadata(data);
        } catch (error) {
            console.error("Error parsing JSON file: ", error);
        }
        };
        reader.readAsText(metaDataFile);

      myDocumentData = {
        ...myDocumentData,
        metadata: metadata,
        project_file: projectFileUrl,
        sample_video_url: sampleVideoFileUrl,
        thumbnail_url: thumbnailFileurl,
      };
      await setDoc(newDocRef, myDocumentData);
      setLoading(false);

      resetForm();
    } catch (error) {
        await deleteDoc(newDocRef);
        setLoading(false);
        console.error("Error uploading files and saving data: ", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-black text-2xl mb-10 font-semibold">Upload New Template</h1>
      <div className="px-5 max-w-[450px] w-full mb-7 relative">
        {
            loading ? (
                <div className="loading-overlay bg-white/50 left-0 top-0 absolute h-full w-full z-10 flex items-center justify-center">
                    <img src={'/images/loading.svg'} alt="Loading" className="h-20" />
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
            className="w-full border border-solid border-[#e3e3e3] bg-[#f9f9f9] p-3 rounded-lg text-base text-[#858585] outline-none"
          />
        </div>
        <div className="pb-5">
          <label htmlFor="project-categrory" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Project Categrory
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] p-3 rounded-lg text-base text-[#858585] outline-none appearance-none bg-no-repeat bg-[right_1rem_top_50%]">
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
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base text-[#858585] outline-none flex items-center relative">
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
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base text-[#858585] outline-none flex items-center relative">
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
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base text-[#858585] outline-none flex items-center relative">
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
          <div className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base text-[#858585] outline-none flex items-center relative">
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
        <div className="pb-5">
          <label htmlFor="Description" className="w-full pb-1.5 block text-base text-[#8e8e8e]">
            Description
          </label>
          <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
            placeholder="Write Description Here..."
            className="w-full border border-solid  border-[#e3e3e3] bg-[#f9f9f9] rounded-lg text-base text-[#858585] resize-none outline-none flex items-center relative p-3"
            rows={4}
          ></textarea>
        </div>
        <div className="text-end">
          <button
            onClick={uploadTemplate}
            className="p-2 px-3 bg-[#e3f7fc] rounded-lg text-semibold text-[#227285] text-center text-sm font-semibold"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTemplate;
