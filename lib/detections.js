const cv = require('opencv');
const red = [0, 0, 255];
const green = [0, 255, 0];
const blue = [255, 0, 0];

const collate = (detections, classes) => {
  let output = [];
  classes.forEach(className => {
    output = output.concat(detections[className]);
  });
  return output;
}

const annotate = (img, detections=[]) => {
  detections.forEach(detection => {
    img.rectangle([detection.x, detection.y], [detection.w, detection.h], blue, 2);
  })
  return img;
}

const blur = (img, detections=[]) => {
  detections.forEach(detection => {
    img.roi(detection.x, detection.y, detection.w, detection.h).gaussianBlur([99,99]);
  })
  return img;
}

module.exports = {
  annotate,
  blur,
  collate
}