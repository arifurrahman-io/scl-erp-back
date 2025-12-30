const csv = require("csv-parser");
const fs = require("fs");

/**
 * @desc Parses CSV file and returns an array of student objects
 * @param {string} filePath - Path to the uploaded temporary file
 */
const parseStudentCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        fs.unlinkSync(filePath); // Delete temp file after parsing
        resolve(results);
      })
      .on("error", (error) => reject(error));
  });
};

module.exports = { parseStudentCSV };
