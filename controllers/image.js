const { exec } = require('child_process');
const fs = require('fs');

const singleImage = (params, callback) => {

  const tmpName = `/tmp/${Date.now()}-${params.image.name}`;
  params.image.mv(tmpName, (err) => {
    
    if (err) return callback({
      status: 500,
      errorMessage: "There was a problem uploading this file",
      errors: [
        err
      ]
    });

    exec(`/home/analytics/code/darknet/darknet ${tmpName}`, (err, stdout, stderr) => {
      if (err || stderr) return callback({
        status: 500,
        errorMessage: "There was a problem analysing this file",
        errors: [
          err || stderr
        ]
      });
      return callback(null, stdout);
    });
  });

}


module.exports = {
  singleImage
}