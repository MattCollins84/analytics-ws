const fs = require('fs');
const cv = require('opencv');
const classify = require('../lib/classify');
const Detections = require('../lib/detections');
const annotate = Detections.annotate;
const blur = Detections.blur;
const collate = Detections.collate;
const filterByROI = Detections.filterByROI;
const Config = require('../lib/config');
const config = new Config('custom');
const async = require('async');

// analyse a single image
const singleImageClassify = (params, callback) => {

  // timestamp
  const ts = Date.now();
  // filename
  const filename = `${ts}-${params.image.name}`
  // tmp filename of original image
  const tmpName = `/tmp/${filename}`;
  // tmp filename of original image with detections drawn
  const tmpDetectionsImg = `./images/${filename}`;

  // move the uploaded image to the tmp location
  params.image.mv(tmpName, (err) => {
    
    if (err) return callback({
      status: 500,
      errorMessage: "There was a problem uploading this file",
      errors: [
        err
      ]
    });

    // determine which classifier commands we need to run
    // add a new action per command
    const actions = [];
    config.getClassifierCommands(params.groups).forEach(classifierParam => {
      const func = function(callback) {
        classify.singleImage(tmpName, classifierParam, (err, data) => {
          if (err) return callback(err);
          return callback(null, data);
        });
      }
      actions.push(func);
    })

    // run the actions in parallel
    async.parallel(actions, (err, results) => {

      if (err) return callback(err);

      // create return object
      const data = {
        ImgW: results[0].ImgW,
        ImgH: results[0].ImgH,
        detections: {
          misc: []
        }
      }

      // add detection groups for specified groups
      params.groups.forEach(groupName => {
        data.detections[groupName] = [];
      });
      
      // filter by ROI
      // collate detections into detection groups
      // default to "misc" if no match
      results.forEach(result => {
        
        // filter detections by ROI
        result.detections = filterByROI(result.detections, params.roi);
        
        // collate into groups
        result.detections.forEach(detection => {
          const detectionGroup = config.hash[detection.name];
          if (params.groups.indexOf(detectionGroup) !== -1) {
            data.detections[detectionGroup].push(detection);
          }
          else {
            data.detections.misc.push(detection);
          }
        });

      });

      // determine if we need to do some image processing
      const imageProcessing = (!!params.annotate.length || !!params.blur.length);
      
      if (imageProcessing) {

        // load the image into OpenCV format
        cv.readImage(tmpName, (err, outputImg) => {
          
          if (err) return callback({
            status: 500,
            errorMessage: "There was a problem loading the output image for processing",
            errors: [
              err
            ]
          });

          // perform processing
          outputImg = annotate(outputImg, collate(data.detections, params.annotate));
          outputImg = blur(outputImg, collate(data.detections, params.blur));

          // save image and add url to output
          outputImg.save(tmpDetectionsImg);
          data.imgUrl = `${config.hostname}/${filename}`;

          return callback(null, data);

        });

      }

      return callback(null, data);

    });

  });

}


module.exports = {
  singleImageClassify
}