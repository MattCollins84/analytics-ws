const { exec } = require('child_process');

const singleImage = (imgPath, classifierParam, callback) => {

  // run YOLO on tmp image
  exec(`/home/analytics/Projects/IPC/cvImgAnalytics ${imgPath} ${classifierParam}`, (err, stdout, stderr) => {
    
    if (err) return callback({
      status: 500,
      errorMessage: "There was a problem analysing this file",
      errors: [
        err
      ]
    });

    // parse output data
    try {
      data = JSON.parse(stdout.toString('utf8'))
    } catch (e) {
      return callback({
        status: 500,
        errorMessage: "An unexpected error occured",
        errors: [
          e
        ]
      });
    }

    return callback(null, data);

  })

}

module.exports = {
  singleImage
}