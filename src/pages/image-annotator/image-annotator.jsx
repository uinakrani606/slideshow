import { useParams } from "react-router-dom";
import uuid from "uuid/v1";
import React, { useEffect, useState, useCallback } from "react";
import CanvasAnnotator from "./canvasAnnotator";
import { db } from "../../firebase";
import { useLocation } from "react-router-dom";
import { getDoc, doc, updateDoc } from "firebase/firestore";

const ImageAnnotator = () => {
  const state = useLocation();
  const { id } = useParams();
  const initialState = state.state;
  const [metaData, setMetadata] = useState(initialState);

  const [slides, setSlides] = useState(JSON.parse(metaData.slides));
  const [slideFrames, setSlideFrames] = useState(metaData.slide_frames ? JSON.parse(metaData.slide_frames) : {});
  const [sceneSize, setSceneSize] = useState({height: 0, width: 0});
  const [newArray, setNewArray] = useState([]);
  const [metadataObj, setMetadataObj] = useState([]);
  const [updatedSlideFrames, setUpdatedSlideFrames] = useState([]);
  const [combinedArrayTemp, setCombinedArrayTemp] = useState(newArray);
  
  const fetchTemplate = useCallback( async() => {
    const docRef = doc(db, "templates", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let fetchedMetadata = docSnap.data();
      setMetadata(fetchedMetadata);
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

  useEffect(() => {
    let data = metaData.metadata;
    data = JSON.parse(data);
    data.id = uuid();
    setMetadataObj(data);
  }, [metaData]);

  const updateTemplate = async () => {
    const templateRef = doc(db, "templates", initialState.id);

    await updateDoc(templateRef, {
      slide_frames: JSON.stringify(updatedSlideFrames)
    }).then(() => {
      setSlideFrames(updatedSlideFrames);
    });
  }

  const updateAnnotations = (updatedAnnotation) => {
    var textAnnotation = [];
    var imageAnnotation = [];
    var sceneName = "";
    let newsceneArray = combinedArrayTemp;
    console.log('newsceneArraynewsceneArraynewsceneArraynewsceneArray', combinedArrayTemp)

    updatedAnnotation.forEach((item) => {
      sceneName = item.name;
      let tempItem = 
      {
        ...item
      };
      console.log('updatedAnnotationupdatedAnnotationupdatedAnnotation',sceneSize.height, tempItem, updatedAnnotation)
      if (item.type === "image") {
        tempItem.x = (item.x + (item.width/2))/sceneSize.width;
        tempItem.y = (item.y + (item.height/2))/sceneSize.height;
        tempItem.width = item.width/sceneSize.width;
        tempItem.height = item.height/sceneSize.height;
        tempItem.aspect_ratio = item.width/item.height;

        imageAnnotation.push(tempItem);
        // console.log("image-annotation", imageAnnotation);
      }
      if (item.type === "text") {
        tempItem.x = (item.x + (item.width/2))/sceneSize.width;
        tempItem.y = (item.y + (item.height/2))/sceneSize.height;
        tempItem.width = item.width/sceneSize.width;
        tempItem.height = item.height/sceneSize.height;
        textAnnotation.push(tempItem);
        // console.log("text-Annotation", textAnnotation);
      }
      tempItem.name = sceneName;
      // console.log(item.name)
    });

    // 4.newsceneArray ne filter karvano and je scene.name 'sceneName' variable jode match thay ena 'image_sizes' na array ma badha 'imageAnnotation' 
    // and scene na text na array ma badha  'textAnnotation' set kari devana
    // scene.image_sizes = imageAnnotation
    const tempSlideFrames = [];
    newsceneArray.forEach((scene) => {
      let slideFrameItem = {};
      if(scene.name === sceneName) {
        scene.images = imageAnnotation;
        scene.text = textAnnotation;
        slideFrameItem.text_frames = textAnnotation;
        slideFrameItem.photo_frames = imageAnnotation;
      } else {
        slideFrameItem.text_frames = scene.text;
        slideFrameItem.photo_frames = scene.images;
      }
      slideFrameItem.name = scene.name;
      
      tempSlideFrames.push(slideFrameItem);
    });

    console.log("tempSlideFramestempSlideFramestempSlideFrames", tempSlideFrames)
    setUpdatedSlideFrames(tempSlideFrames);
    setCombinedArrayTemp(newsceneArray);

    // eslint-disable-next-line
  }

  useEffect(() => {
    if (newArray.length) {
    const img = new Image();
      img.src = newArray[0].url
      setSceneSize({ width: img.width, height: img.height });

      img.onload = () => {
        setSceneSize({ width: img.width, height: img.height });
      };
    }
    // eslint-disable-next-line
  }, [id, metadataObj.id]);

  useEffect(() => {
    console.log('updatedddddd')
  createCombinedArray(
    metadataObj.scenes,
    metadataObj.image_sizes,
    metadataObj.text
  );
    // eslint-disable-next-line
  }, [id, metadataObj.id, metaData.slides, metaData.slide_frames, metaData, metadataObj.scenes, metadataObj.image_sizes, metadataObj.text])

  const createCombinedArray = (scenes, imageSizes, text) => {
    // console.log(scenes, imageSizes, text);
    let combinedArray = [];
    scenes?.forEach((scene) => {
      let sceneImageData = slides.slide_uploads.find(
        (item) => {
          return item.scene_name === scene.name
        }
      );
      let combinedScene = {
        ...scene,
        url: sceneImageData ? sceneImageData.url : "",
        slide: sceneImageData ? sceneImageData.slide : "",
        images: [],
        text: [],
      };
      if (slideFrames.length > 0 && sceneImageData) {
        let frameData = slideFrames.find(
          (frame) => {
            console.log(frame, sceneImageData)
            return frame.name === sceneImageData.scene_name
          }
        );
        if (frameData) {
          combinedScene.images = frameData.photo_frames;
          combinedScene.text = frameData.text_frames;
        }
        
      } else {
        let matchingImages = imageSizes.filter((image) =>
          {
            return image.name.includes(`photo-${scene.sceneIndex}`)
          }
        );
        combinedScene.images = matchingImages;
        let matchingText = text.filter((t) =>
          t.layer_name.includes(`text-${scene.sceneIndex}`)
        );
        combinedScene.text = matchingText;
      }
      combinedArray.push(combinedScene);
    });
    setCombinedArrayTemp(combinedArray);
    console.log("createCombinedArraycreateCombinedArray", combinedArray)

    setNewArray(combinedArray);
    return combinedArray;
  }
  
  return (
    <div className="canvas-img inline-block">
      <div className="mx-3">
        <button className="bg-emerald-400 py-1 px-3 rounded-md" onClick={updateTemplate}>save</button>
      </div>
      {newArray.map((scene, index) => {
        return (
          <div key={index} id={scene.sceneIndex} className="inline-block">
            <CanvasAnnotator
              scene={scene}
              sceneSize={sceneSize}
              updateAnnotations={updateAnnotations}
            />
          </div>
        );
      })}
    </div>
  );
};
export default ImageAnnotator;
