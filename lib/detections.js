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
      
      // is this a valid detection?
      let valid = false;
      switch(oi.matchingType) {
        case 'intersect':
          valid = intersectRect(detection, region);
          break;
        case 'contains':
          valid = containsRect(detection, region);
          break;
      }
      
      console.log(roi.matchingType, region, detection, valid);
      
      return valid;
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

// r1 intersects r2
const intersectRect = (r1, r2) => {
  return !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

// r1 is inside r2
const containsRect = (r1, r2) => {
  return r1.left >= r2.left && r1.right <= r2.right && r1.top >= r2.top && r1.bottom <= r2.bottom;
}

module.exports = {
  annotate,
  blur,
  collate,
  filterByROI,
  convertToTBLR
}