const { exec } = require('child_process');
const fs = require('fs');
// const cv = require('opencv4nodejs');

// analyse a single image
const singleImage = (params, callback) => {

  // tmp filename of original image
  const tmpName = `/tmp/${Date.now()}-${params.image.name}`;
  // tmp filename of YOLO response data
  const tmpOutput = `${tmpName}-output.txt`;
  // tmp filename of original image with detections drawn
  const tmpDetectionsImg = `${tmpName}-output.jpg`;

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

      // read the output data
      fs.readFile(tmpOutput, (err, data) => {
        
        if (err) return callback({
          status: 500,
          errorMessage: "There was a problem reading the analysis output",
          errors: [
            err
          ]
        });

        // parse output data?
        let lines = data.toString('utf8').split("\n");
        lines = lines.reduce((arr, line) => {
          const bits = line.split("\t");
          const obj = {
            name: bits[0],
            confidence: bits[1],
            x: bits[2],
            y: bits[3],
            width: bits[4],
            height: bits[5]
          };
          arr.push(obj);
          return arr;
        }, [])

        // load the image into opencv
        // cv.imreadAsync(tmpName, (err, outputImg) => {
          
        //   if (err) return callback({
        //     status: 500,
        //     errorMessage: "There was a problem creating the output image",
        //     errors: [
        //       err
        //     ]
        //   });

        //   // blue
        //   const colour = new cv.Vec3(255, 0, 0);
          
        //   // capture the detections and draw a rectangle for each
        //   const rectangles = data.detections;
        //   rectangles.forEach(rectangle => {
        //     const position = new cv.Rect(x, y, width, height);
        //     outputImg.drawRectangle(position, colour);
        //   });

        //   // write to tmp detections image
        //   cv.imwriteAsync(tmpDetectionsImg, outputImg, (err) => {
            return callback(null, lines);
          // });

        // });
        
      });

    });

  });

}


module.exports = {
  singleImage
}