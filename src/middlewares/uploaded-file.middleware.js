import multer from "multer";

class UploadedFileMiddleware {
  _upload;

  constructor() {
    const storage = multer.memoryStorage();
    this._upload = multer({ storage });
  }

  parseFile() {
    return (req, res, next) => {
      this._upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError)
          // Handle Multer errors
          return res
            .status(400)
            .json({ error: `Multer error: ${err.message}` });
        else if (err)
          // Handle other errors
          return res
            .status(500)
            .json({ error: `Server error: ${err.message}` });

        next();
      });
    };
  }
}

export const uploadedFileMiddleware = new UploadedFileMiddleware();
