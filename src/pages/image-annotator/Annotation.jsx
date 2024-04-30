import React, { useEffect } from "react";
import { Rect, Transformer  , Text} from "react-konva";

const Annotation = ({ shapeProps, isSelected, onSelect, onChange  , text}) => {
  const shapeRef = React.useRef();
  const transformRef = React.useRef();
  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      transformRef.current.zIndex(10000);
      transformRef.current.setNode(shapeRef.current);
      transformRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    console.log(shapeRef.current)
      // shapeRef?.current?.appendChild('<span>'+text+'</span>');
  }, [shapeRef])

  const enabledAnchors =
    shapeProps.type === "text"
      ? [
          "middle-right",
          "middle-left",
          "top-center",
          "bottom-center",
          "bottom-right",
          "top-left",
          "top-right",
          "bottom-left",
        ]
      : ["bottom-right", "top-left", "top-right", "bottom-left"];
  const onMouseEnter = (event) => {
    event.target.getStage().container().style.cursor = "move";
  };

  const onMouseLeave = (event) => {
    event.target.getStage().container().style.cursor = "crosshair";
  };

  return (
    <React.Fragment>
      <Rect
        fill={shapeProps.type === "text" ? "#3f51b56e" : "#333146a6"}
       stroke="transparent"
        onMouseDown={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable={true}
        rotateLineVisible={false}
        resizeEnabled={false}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDragEnd={(event) => {
          onChange({
            ...shapeProps,
            x: event.target.x(),
            y: event.target.y(),
          });
        }}
        flipEnabled={false}
        useSingleNodeRotation={false}
        onTransformEnd={(event) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const layer = shapeRef.current;
          const scaleX = layer.scaleX();
          const scaleY = layer.scaleY();

          // we will reset it back
          layer.scaleX(1);
          layer.scaleY(1);
          onChange({
            ...shapeProps,
            x: layer.x(),
            y: layer.y(),
            // set minimal value
            width: Math.max(5, layer.width() * scaleX),
            height: Math.max(layer.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          enabledAnchors={enabledAnchors}
          rotateEnabled={false}
          ref={transformRef}
        >
      <Text fontSize={14} fill="#fff" text={text}/>
        </Transformer>
      )}
    </React.Fragment>
  );
};

export default Annotation;
