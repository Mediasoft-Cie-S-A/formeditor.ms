/*!
 * Copyright (c) 2023 Mediasoft & Cie S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function(app, session, passport) {

const fs = require('fs-extra');
const path = require('path');
const formidable = require('formidable');
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next(); }
    res.redirect("/login");
};

function getFileStats(file) {
  try {
    const stats = fs.statSync(file);
  //  console.log(stats);
    return {
      fileName: path.basename(file),
      fileType: stats.isDirectory() ? 'folder' : 'file',      
      size: stats.size,      
      createdDate: stats.birthtime.toISOString().split('T')[0],
      modifiedDate: stats.mtime.toISOString().split('T')[0],
      owner: stats.uid,
      group: stats.gid,
      permissions: stats.mode
     };
  } catch (error) {
    console.error('Error getting file stats:', error);
    return null;
  }
}



// create 

// create route for file explorer with path parameter
app.get('/fileExplorer', checkAuthenticated, async (req, res) => {
    try
    {
        const directory = req.query.directory || '/';
        // get file filter
        const filter = req.query.filter || '';
        
        console.log(directory);
        fs.readdir(directory, async (err, files) => {
            if (err) {
              console.error('Error getting directory:', err);
              res.send([]);
            } else {
              const result = [];
              for (const file of files) {
                // check if the file match the filter
                    console.log(file);
                    console.log(filter);
                    if (file.includes(filter) || filter.length<3 || filter==='')
                    {
                        const filePath = path.join(directory, file);
                        const fileStats = getFileStats(filePath);
                        console.log(fileStats);                
                        result.push(fileStats);
                    }               
                }
              res.send(result);
            }
          });
    }catch (error) {
        console.error('Error reading directory:', error);
        res.send([]);
      }
});

// upload multi file route with path parameter in the post and the file in the body
app.post('/uploadMultiFile', checkAuthenticated, async (req, res) => {
    try
    {
         //Create an instance of the form object
         const form = new formidable.IncomingForm();
         var newpath = req.query.path + '/' || '/';
         console.log(newpath);
          
        //Process the file upload in Node
        form.parse(req, function (error, fields, uploadedFiles) {
            //Get the uploaded file data
            const files = uploadedFiles.fileupload;
            
            //Loop through the files
            for (const file of files) {
                    console.log(file);
                    //Get the temp file path
                    const filepath = file.filepath;
                    newpath += file.originalFilename;
                    console.log(filepath);
                    console.log(newpath);
                    // check if the file exist
                    if (fs.existsSync(newpath)) {
                       // file exists rename it with a timestamp
                          var d = new Date();
                          var timestamp = d.getTime();
                          var histname = newpath + timestamp;
                          fs.renameSync(newpath, histname);                   
                    
                    }                   
                    //Copy the uploaded file to a custom folder
                    fs.renameSync(filepath, newpath);
                    console.log('File uploaded successfully!');
                }
                //Send a NodeJS file upload confirmation message
                res.send("{'NodeJS File(s) Upload Success!'}");
        });
            
    }catch (error) {
        console.error('Error uploading files:', error);
        res.send("{'Error uploading files'}");
      }
    });



}; // end of module.exports