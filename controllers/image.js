const { exec } = require('child_process');
const fs = require('fs');

const singleImage = (params, callback) => {

  const tmpName = `/tmp/${Date.now()}-${params.image.name}`;
  const tmpOutput = `${tmpName}-output.txt`;

  params.image.mv(tmpName, (err) => {
    
    if (err) return callback({
      status: 500,
      errorMessage: "There was a problem uploading this file",
      errors: [
        err
      ]
    });

    exec(`/home/analytics/code/darknet/darknet ${tmpName} ${tmpOutput}`, (err, stdout, stderr) => {
      if (err) return callback({
        status: 500,
        errorMessage: "There was a problem analysing this file",
        errors: [
          err
        ]
      });
      fs.readFile(tmpOutput, (err, data) => {
        if (err) return callback({
          status: 500,
          errorMessage: "There was a problem reading the analysis output",
          errors: [
            err
          ]
        });
        return callback(null, data.tpString('utf8'));
      });
    });
  });

}


module.exports = {
  singleImage
}