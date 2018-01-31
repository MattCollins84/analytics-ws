const cv = require('opencv');
const red = [0, 0, 255];
const green = [0, 255, 0];
const blue = [255, 0, 0];

const collate = (detections, groups) => {
  let output = [];
  groups.forEach(groupName => {
    output = output.concat(detections[groupName] || []);
  });
  return output;
}

const annotate = (img, detections=[]) => {
  detections.forEach(detection => {
    img.rectangle([detection.x, detection.y], [detection.w, detection.h], green, 2);
  })
  return img;
}

const blur = (img, detections=[]) => {
  detections.forEach(detection => {
    img.roi(detection.x, detection.y, detection.w, detection.h).gaussianBlur([99,99]);
  })
  return img;
}

const filterByROI = (detections, rois = []) => {

  // no point doing anything if we have no rois
  if (rois.length === 0) return detections;

  let validDetections = [];
  
  // for each Region of Interest
  rois.forEach(roi => {
    
    // convert region to TBLR format
    const region = convertToTBLR(roi);
    
    // then, filter detections by intersection
    const valid = detections.filter(d => {  
      // convert detection to TBLR format
      const detection = convertToTBLR(d);
      
      const valid = roi.matchingType === 'intersect' ? intersectRect(detection, region) : containsRect(detection, region);
      
      console.log(roi.matchingType, region, detection, valid);
      
      return intersect;
    });

    validDetections = validDetections.concat(valid);

  })

  return validDetections;
}

// converts { x, y, h, w } to { top, bottom, left, right }
const convertToTBLR = (detection) => {
  return {
    top: detection.y,
    bottom: detection.y + detection.h,
    left: detection.x,
    right: detection.x + detection.w
  }
}

const intersectRect = (r1, r2) => {
  return !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

module.exports = {
  annotate,
  blur,
  collate,
  filterByROI,
  convertToTBLR
}