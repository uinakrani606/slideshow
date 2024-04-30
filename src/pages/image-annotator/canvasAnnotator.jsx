import React, { useState, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import uuid from "uuid/v1";
import ImageFromUrl from "./ImageFromUrl";
import Annotation from "./Annotation";
import "./Image-annotator.scss";
const CanvasAnnotator = ({ scene , updateAnnotations , sceneSize}) => {
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [selectedId, selectAnnotation] = useState(null);
  const [containerId] = useState(
    (Math.random() + 1).toString(36).substring(7)
  );
  useEffect(() => {
    setCanvasMeasures(sceneSize);
  }, [sceneSize, sceneSize.height, sceneSize.width])

  const [canvasMeasures, setCanvasMeasures] = useState({height: 0, width: 0});
  useEffect(() => {
    // Get Image Size
    let tempAnootations = [];
    scene.images.map((image, i) => {
      // Calculate the position relative to the stage
      const layerStagePosX = (image.x * canvasMeasures.width) - ((image.width) * canvasMeasures.width / 2);
       const layerStagePosY = (image.y * canvasMeasures.height) - ((((image.width) * canvasMeasures.width) / image.aspect_ratio) / 2);

      let newImageObject = {
        x: layerStagePosX,
        y: layerStagePosY,
        tempX: image.x,
        tempY: image.y,
        width: image.width ? (image.width) * canvasMeasures.width : 100,
        height: image.aspect_ratio ? (((image.width) * canvasMeasures.width) / image.aspect_ratio) : 100,  
        name: scene.name,
        id: uuid(),
        type: "image",
        length: scene.images.length,
        text: image.name
      };
      return tempAnootations.push(newImageObject);
    });
    scene.text.map((textItem, i) => { 
       // Calculate the position relative to the stage
       const layerStagePosX = (textItem.x * canvasMeasures.width) - ((textItem.width) * canvasMeasures.width / 2);
       const layerStagePosY = (textItem.y * canvasMeasures.height) - ((textItem.height) * canvasMeasures.height / 2);

      let newTextObject = {
        x: layerStagePosX,
        y: layerStagePosY,
        name: scene.name,
        width: textItem.width ? (textItem.width) * canvasMeasures.width : 200,
        height: textItem.height ? (textItem.height) * canvasMeasures.height : 60,
        id: uuid(),
        length: scene.text.length,
        type: "text",
        text: textItem.name
      };
      // console.log("New text object x-coordinate:", newTextObject);
      return tempAnootations.push(newTextObject);
    });
    setAnnotations((prevAnnotations) => [prevAnnotations, ...tempAnootations]);
    // console.log(annotations);
  }, [scene.url, scene.images, scene.text, scene.name, canvasMeasures.width, canvasMeasures.height]);
  
  const handleMouseMove = (event) => {
    if (selectedId === null && newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      // console.log(event.target.getS);
      const { x, y } = event.target.getStage().getPointerPosition();
      const id = uuid();
      setNewAnnotation([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          id,
        },
      ]);
    }
  };
  const handleMouseUp = () => {
    // console.log(newAnnotation, setContainerId);
    if (selectedId === null && newAnnotation.length === 1) {
      annotations.push(...newAnnotation);
      setAnnotations(annotations);
      setNewAnnotation([]);
    }
  };
  const handleMouseEnter = (event) => {
    event.target.getStage().container().style.cursor = "crosshair";
  };
  const handleKeyDown = (event) => {
    if (event.keyCode === 8 || event.keyCode === 46) {
      if (selectedId !== null) {
        const newAnnotations = annotations.filter(
          (annotation) => annotation.id !== selectedId
        );
        setAnnotations(newAnnotations);
      }
    }
  };
  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <div
      tabIndex={1}
      id={containerId}
      onKeyDown={handleKeyDown}
      className="stage"
      style={{marginBottom: "10px"}}
    >
      <Stage
        container={containerId}
        width={canvasMeasures.width}
        height={canvasMeasures.height}
        onMouseEnter={handleMouseEnter}
        onMouseMove={newAnnotation.length === 0 ? handleMouseMove : null}
        onMouseUp={newAnnotation.length === 0 ? handleMouseUp : null}
      >
        <Layer>
          <ImageFromUrl
            setCanvasMeasures={setCanvasMeasures}
            imageUrl={scene.url}
            className="image"
            onMouseDown={() => {
              selectAnnotation(null);
            }}
          />
          {annotationsToDraw.map((annotation, i) => {
            return (
              <Annotation
                key={i}
                shapeProps={annotation}
                type={annotation.type}
                text={annotation.text}
                isSelected={annotation.id === selectedId}
                onSelect={() => {
                  selectAnnotation(annotation.id);
                }}
                onChange={(newAttrs) => {
                  const updatedAnnotations = annotations.map((ann) =>
                    ann.id === annotation.id ? newAttrs : ann
                  );
                  setAnnotations(updatedAnnotations);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasAnnotator;
