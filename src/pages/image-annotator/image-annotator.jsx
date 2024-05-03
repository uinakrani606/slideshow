import React, { useEffect, useState, useCallback } from "react";
import CanvasAnnotator from "./canvasAnnotator";
import { useLocation } from "react-router-dom";

const ImageAnnotator = () => {
  const state = useLocation();
  const initialState = state.state;
  const [metaData, setMetadata] = useState(initialState);

  const [slides, setSlides] = useState(JSON.parse(metaData.slides));
  const [slideFrames, setSlideFrames] = useState(metaData.slide_frames ? JSON.parse(metaData.slide_frames) : {});
  const [sceneSize, setSceneSize] = useState({height: 0, width: 0});
  const [newArray, setNewArray] = useState([]);
  const [metadataObj, setMetadataObj] = useState([]);
  
  useEffect(() => {
    setMetadata(state.state);
  }, [state])

  useEffect(() => {
    setSlides(JSON.parse(metaData.slides));
    setSlideFrames(metaData.slide_frames ? JSON.parse(metaData.slide_frames) : {});
  }, [metaData])

  const createCombinedArray = (scenes, imageSizes, text) => {
    // console.log(scenes, imageSizes, text);
    let combinedArray = [];
    scenes?.forEach((scene) => {
      console.log("dfsdfsdfsdf", slides, scene)
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
            return frame.name === sceneImageData.scene_name
          }
        );
        combinedScene.images = frameData.photo_frames;
        combinedScene.text = frameData.text_frames;
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
    return combinedArray;
  }

  useEffect(() => {
    const data = metaData.metadata;
    setMetadataObj(JSON.parse(data));
  }, [metaData]);

  function handleSaveButtonClick() {
    let modifiedWidth = 800;
    let modifiedHeight = 800;
    let sceneToModify = newArray.find((scene) => scene.name === "Scene_2");
    if (sceneToModify) {
      sceneToModify.images.forEach((image) => {
        image.width = modifiedWidth;
        image.height = modifiedHeight;
      });
    }
  }

  const updateAnnotations = useCallback((updatedAnnotation) => {
    console.log('updated anootation', updatedAnnotation)
    var newsceneArray = newArray;
    var textAnnotation = [];
    var imageAnnotation = [];
    var sceneName = "";
    updatedAnnotation.forEach((item) => {
      if (item.type === "image") {
        imageAnnotation.push(item);
        // console.log("image-annotation", imageAnnotation);
      }
      if (item.type === "text") {
        textAnnotation.push(item);
        // console.log("text-Annotation", textAnnotation);
      }
      item.name = sceneName;
      // console.log(item.name)
    });

    // 4.newsceneArray ne filter karvano and je scene.name 'sceneName' variable jode match thay ena 'image_sizes' na array ma badha 'imageAnnotation' 
    // and scene na text na array ma badha  'textAnnotation' set kari devana
    // scene.image_sizes = imageAnnotation
    const updatedArray = newsceneArray.map((scene) => {
      if (scene.name === sceneName) {
        scene.image_sizes.forEach((images) => {
          imageAnnotation.push(images);
        });
        scene.text.forEach((text) => {
          textAnnotation.push(text);
        });
      }
      return {
        ...scene,
        image_sizes: imageAnnotation,
        text: textAnnotation
      };
    });
    console.log(updatedArray)
    return updatedArray
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (newArray.length) {
    const img = new Image();
      img.src = newArray[0].url;
      img.onload = () => {
        setSceneSize({ width: img.width, height: img.height });
      };
    }
  }, [newArray]);

  useEffect(() => {    
  const sceneNewArray = createCombinedArray(
    metadataObj.scenes,
    metadataObj.image_sizes,
    metadataObj.text
  );
    setNewArray(sceneNewArray)
    // eslint-disable-next-line
  }, [metadataObj.scenes, metadataObj.image_sizes, metadataObj.text])

  return (
    <div className="canvas-img inline-block">
      <button className="hidden" onClick={handleSaveButtonClick}>save</button>
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
