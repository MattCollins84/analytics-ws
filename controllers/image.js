const fs = require('fs');
const cv = require('opencv');
const classify = require('../lib/classify');
const Config = require('../lib/config');
const config = new Config('custom');
const async = require('async');

// analyse a single image
const singleImageClassify = (params, callback) => {

  // timestamp
  const ts = Date.now();
  // tmp filename of original image
  const tmpName = `/tmp/${ts}-${params.image.name}`;
  // tmp filename of original image with detections drawn
  const tmpDetectionsImg = `./images/${ts}-${params.image.name}`;

  // move the uploaded image to the tmp location
  params.image.mv(tmpName, (err) => {
    
    if (err) return callback({
      status: 500,
      errorMessage: "There was a problem uploading this file",
      errors: [
        err
      ]
    });

    const actions = [];
    config.getClassifierCommands(params.classes).forEach(classifierParam => {
      const func = function(callback) {
        classify.singleImage(tmpName, classifierParam, (err, data) => {
          if (err) return callback(err);
          return callback(null, data);
        });
      }
      actions.push(func);
    })

    async.parallel(actions, (err, results) => {

      if (err) return callback(err);

      const data = {
        ImgW: results[0].ImgW,
        ImgH: results[0].ImgH,
        detections: {
          misc: []
        }
      }

      params.classes.forEach(className => {
        data.detections[className] = [];
      });
      
      results.forEach(result => {
        result.detections.forEach(detection => {
          const detectionClass = config.hash[detection.name];
          if (params.classes.indexOf(detectionClass) !== -1) {
            data.detections[detectionClass].push(detection);
          }
          else {
            data.detections.misc.push(detection);
          }
        })
      })

      return callback(null, data);

    });


      // // load the image into opencv
      // cv.readImage(tmpName, (err, outputImg) => {
        
      //   if (err) return callback({
      //     status: 500,
      //     errorMessage: "There was a problem loading the output image",
      //     errors: [
      //       err
      //     ]
      //   });

      //   if (params.annotate) {
      //     // colours
      //     const red = [0, 0, 255];
      //     const green = [0, 255, 0];
      //     const blue = [255, 0, 0];

      //     // capture the detections and draw a rectangle for each
      //     const detections = data.detections;
      //     detections.forEach(detection => {
      //       outputImg.rectangle([detection.x, detection.y], [detection.w, detection.h], red, 2);
      //       outputImg.putText(detection.name, detection.x + 10, detection.y + 15, "HERSEY_SIMPLEX", red, 0.5, 2);
      //     });

      //     // outputImg.putText("TEST", 25, 20, "HERSEY_SIMPLEX", red, 1, 2);
      //     // outputImg.putText("TEST", 25, 120, "HERSEY_SIMPLEX", green, 2, 3);
      //     // outputImg.putText("TEST", 25, 220, "HERSEY_SIMPLEX", blue, 4, 4);

      //     // write to tmp detections image
      //     outputImg.save(tmpDetectionsImg);

      //     data.imgUrl = `/${ts}-${params.image.name}`;
      //   }

      //   return callback(null, data);

      // });

    // });

  });

}


module.exports = {
  singleImageClassify
}