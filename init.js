#!/usr/bin/env node
const fs = require('fs-extra');
const prompt = require('prompt');

// Directory labels
const src = "source directory",
      dist = "distribution directory",
      lang = "default language",
      views = "views directory",
      data = "data files directory",
      partials = "partials directory",
      partialsData = "partials data directory";



getConfig();

function getConfig() {
   const initialSchema = {
      properties: {
         "source directory": {
            required: true,
            default: "./src"
         },

         "distribution directory": {
            required: true,
            default: "./dist"
         },

         "default language": {
            required: true,
            default: "en-uk"
         }
      }
   };

   getInput(initialSchema).then((result1) => {
      const nextSchema = {
         properties: {}
      };

      stripSlashes(result1);
      
      nextSchema.properties[views] ={
               required: true,
               default: result1[src] + "/templates/" + "views"
      };

      nextSchema.properties[data] = {
               required: true,
               default: result1[src] + "/templates/" + "data"
      };

      nextSchema.properties[partials] = {
               required: true,
               default: result1[src] + "/templates/" + "partials"
      };

      nextSchema.properties[partialsData] =  {
               required: true,
               default: result1[src] + "/templates/" + "partials-data"
      };   
      

      getInput(nextSchema).then((result2) => {
         Object.assign(result1, result2);
         fs.writeFile('./lang-config.json', JSON.stringify(result1, null, 3), (err) => {     if (err) return console.log(err);    }); 
         handleDirectories(result1);
      }).catch(error);
   }).catch(error);


}

function handleDirectories(result) {
   const msg = "Generate directories that don't exist? [Y/n]";
   prompt.get([msg], (err, ans) => {
      if (err) { error(err); return; }
      
      var response = ans[msg].toLowerCase();
      if (response != 'y' && response != 'yes') return;

      createDirectories(result);
   });
}

function createDirectories(result) {
   console.log(JSON.stringify(result, null, 3));
   createDirectory(result[dist]);
   createDirectory(result[src]);
   createDirectory(result[views]);
   createDirectory(result[data]);
   createDirectory(result[partials]);
   createDirectory(result[partialsData]);

   createDirectory(result[views] + "/" + result[lang]);
   createDirectory(result[data] + "/" + result[lang]);

   fs.writeFile(result[views] + "/" + result[lang] + "/example.html", '<div>{{test}}</div>', (err) => {     if (err) return console.log(err);    }); 
   fs.writeFile(result[data] + "/" + result[lang] + "/example.json", '{ "test": "a test"}', (err) => {     if (err) return console.log(err);    }); 

}

function createDirectory(dir) {
      var dirs = dir.split("/");
   if (dir[0] == '.') dirs.splice(0,1);

   for (i = 0; i < dirs.length; i++) {
      var thisDir = dirs.slice(0, i + 1).join('/');
   
      if (!fs.existsSync(thisDir))
         fs.mkdirSync(thisDir);
   }

}

function error(err) {
   console.log(err);
}

function getInput(schema) {
   return new Promise((resolve, reject) => {
      prompt.get(schema, (err, result) => {
         if (err) { reject(err); return; }

         resolve(result);    
      });
   });
}

function stripSlashes(obj) {
   for (var prop in obj) 
      if (obj.hasOwnProperty(prop)) {
         var str = obj[prop];
         if (str[str.length - 1] == '/')
            obj[prop] = str.substring(0, str.length - 1);
      }
}