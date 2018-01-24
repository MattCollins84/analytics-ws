const { exec } = require('child_process');
const fs = require('fs');
const cv = require('opencv');

// analyse a single image
const singleImage = (params, callback) => {

  // timestamp
  const ts = Date.now();
  // tmp filename of original image
  const tmpName = `/tmp/${ts}-${params.image.name}`;
  // tmp filename of YOLO response data
  const tmpOutput = `${tmpName}-output.txt`;
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

    // run YOLO on tmp image
    exec(`/home/analytics/Projects/IPC/cvImgAnalytics ${tmpName} ${tmpOutput}`, (err, stdout, stderr) => {
      
      if (err) return callback({
        status: 500,
        errorMessage: "There was a problem analysing this file",
        errors: [
          err
        ]
      });

      console.log("STD OUT")
      console.log(stdout);

      // read the output data
      fs.readFile(tmpOutput, (err, data) => {
        
        if (err) return callback({
          status: 500,
          errorMessage: "There was a problem reading the analysis output",
          errors: [
            err
          ]
        });

        // parse output data
        try {
          data = JSON.parse(data.toString('utf8'))
        } catch (e) {
          return callback({
            status: 500,
            errorMessage: "An unexpected error occured",
            errors: [
              e
            ]
          });
        }

        // load the image into opencv
        cv.readImage(tmpName, (err, outputImg) => {
          
          if (err) return callback({
            status: 500,
            errorMessage: "There was a problem loading the output image",
            errors: [
              err
            ]
          });

          // blue
          const red = [0, 0, 255];
          const green = [0, 255, 0];
          const blue = [255, 0, 0];

          // capture the detections and draw a rectangle for each
          const detections = data.detections;
          detections.forEach(detection => {
            outputImg.rectangle([detection.x, detection.y], [detection.w, detection.h], red, 2);
            outputImg.putText(detection.name, detection.x + 10, detection.y + 15, "HERSEY_SIMPLEX", red, 0.5, 2);
          });

          // outputImg.putText("TEST", 25, 20, "HERSEY_SIMPLEX", red, 1, 2);
          // outputImg.putText("TEST", 25, 120, "HERSEY_SIMPLEX", green, 2, 3);
          // outputImg.putText("TEST", 25, 220, "HERSEY_SIMPLEX", blue, 4, 4);

          // write to tmp detections image
          outputImg.save(tmpDetectionsImg);

          data.imgUrl = `/${ts}-${params.image.name}`;

          return callback(null, data);

        });
        
      });

    });

  });

}


module.exports = {
  singleImage
}