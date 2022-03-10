const cloudinary = require("cloudinary").v2;

exports.cloudinaryUpload = (req, res) => {
  console.log(`req.file : `, req.file);
  const path = req.file.path;
  const uniqueFilename = new Date().toISOString();

  // uploading image to cloudinary.
  const result = cloudinary.uploader.upload(
    path,
    { resource_type: "raw", public_id: `Noyz/${uniqueFilename}`, tags: `Noyz` }, // directory and tags are optional
    (err, file) => {
      if (err) return res.send(err);
      console.log("file uploaded to Cloudinary");
      // remove file from server
      const fs = require("fs");
      fs.unlinkSync(path);
      // return image details
      return file;
    }
  );
  return result;
};
