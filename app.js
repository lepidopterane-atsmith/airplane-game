/* CSC 220 HW4 Yuhui (Helen) Du
   this is the http server file that creates 
   an http server, process the client incoming requests
   and call the funciton that is exported by module.js
*/

// require node modules 
var http = require('http');
var url = require("url");
// import the module (in the same directory so we use ./)
var myModule = require('./module.js');
var albumQuery = require('./albumQuery.js');

//create a server object:
//the arrow function is a callback fucntion 
myserver = http.createServer((req, res) => {
    // parse the url and save it 
    var urlParse = url.parse(req.url);
    var path = urlParse.pathname;
    console.log("path is" + path);
    var queryObj = url.parse(req.url, "true").query;
    console.log("queryObj is " + JSON.stringify(queryObj));
    // If URL contains a file path, call the method that reads and serves a static file
    if (path && path.length > 1){
        // call serveStatic function in module.js
        myModule.serveStatic(req, res);
    }
    // If the URL contains a query
    if (queryObj.request){
        // call the method that process and serves up the response to this query
        albumQuery.processQuery(queryObj, res);
    }
});

//the server object listens on port 8080
myserver.listen(8080); 