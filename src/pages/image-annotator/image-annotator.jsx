import React, { useEffect, useState } from "react";
import CanvasAnnotator from "./canvasAnnotator";
import Image1 from "../../image/image-3.png";
import { useLocation } from "react-router-dom";
// import { Functions } from "@mui/icons-material";

const ImageAnnotator = (props) => {
  const state = useLocation();
  const initialState = state.state;

  // @ts-ignore
  const [metaData, setMetaData] = useState(initialState);
  // @ts-ignore
  const [slides, setSlides] = useState(JSON.parse(metaData.slides));
  // @ts-ignore
  const [slideFrames, setSlideFrames] = useState(JSON.parse(metaData.slide_frames));
  
  function createCombinedArray(scenes, imageSizes, text) {
    // console.log(scenes, imageSizes, text);
    let combinedArray = [];
    scenes.forEach((scene) => {
      console.log("metaData.slide_frames", slideFrames)
      let sceneImageData = slides.slide_uploads.find(
        (item) => {
          return item.scene_name === scene.name
        }
      );
      let combinedScene = {
        ...scene,
        url: sceneImageData.url,
        slide: sceneImageData.slide,
        images: [],
        text: [],
      };
      if (slideFrames.length > 0) {
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
      console.log("metaData.combinedScene", combinedScene)
      combinedArray.push(combinedScene);
    });
    return combinedArray;
  }
  const data = state.state.metadata;
  const metadataObj = JSON.parse(data);
  const newArray = createCombinedArray(
    metadataObj.scenes,
    metadataObj.image_sizes,
    metadataObj.text
  );

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

  function updateAnnotations(updatedAnnotation) {
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
  }
  useEffect(() => {
   
  });

  return (
    <div className="canvas-img">
      <button onClick={handleSaveButtonClick}>save</button>
      {newArray.map((scene, index) => {
        return (
          <div key={index} id={scene.sceneIndex}>
            <CanvasAnnotator
              imageUrl={Image1}
              scene={scene}
              updateAnnotations={updateAnnotations}
            />
          </div>
        );
      })}
    </div>
  );
};
export default ImageAnnotator;
