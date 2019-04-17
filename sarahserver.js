// Sarah Abowitz, HW3
// 3/31/19
// I would have named this fileserver
// But I called this sarahserver
// because it has server fns
// and I made it

// modules we need:
fs = require('fs'); // fs we need because we're reading FILES
path = require('path'); // path is where extname lives

// only method from this file so far! given a sanitized filepath & res,
// sends client files they neeeed
exports.sendFile = function(filePath, res){
    console.log(filePath);
    fs.readFile("public_html"+filePath,"binary",function(err,data) {
        if (err) { 
            // if we got an error, the file isn't in public_html
            // (probably because the request was misspelled)
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('Error 404: resource not found.');
            res.end();
        }
        else {
            var contentType; // this is gonna be a string that
                            // is content-type[1]
            switch(path.extname(filePath)){ // we determine that str
                                           // looking at its ending
                case '.html':
                    contentType = 'text/html';
                    break;
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.txt':
                    contentType = 'text/plain';
                    break;
                case '.jpg':
                    contentType = 'image/jpeg';
                    break;
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.gif':
                    contentType = 'image/gif';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
            }
            res.writeHead(200, {'Content-Type': contentType });
            res.write(data,"binary");
            res.end();
            console.log(filePath);
        }
    });
};