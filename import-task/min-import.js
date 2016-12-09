'use strict';

module.exports = function(grunt) {
    grunt.registerTask('import', 'task to import files into an iife', function() {
      var path = require('path');

      var fileDetails = this.options();

      /*map to contain key and value pairs for file-path and variables used to initialise the import*/
      var _fileImportMap = {};

      var createImportString = function(importVarsArray, sourceToImport, moduleVars){
        var importString = "";
        if(importVarsArray.length == 1){
          importString = sourceToImport.trimRight() + "()";
        }else{
          importString = sourceToImport.trimRight() + "(" + moduleVars.substring(moduleVars.indexOf(",")+1) + ")";
        }
        return importString;
      };

      var importRecursive = function(filepath){
        var src = grunt.file.read(filepath);
        var newSource= src;
        var matchesArray = [];
        var _resolvedSource;
        var importString = "";

        grunt.file.write(fileDetails.dest, src);

        var importReg = /(?:([\w]*)\s*=\s*)?(_import\((.+)\);?,?)/g;

        while ((matchesArray = importReg.exec(src))) {
          var importVarsArray = matchesArray[3].split(",");
          var importpath = importVarsArray[0].replace(/"|'/g, "");
          //resolve the file path
          if(importpath.indexOf('/')!==0){
              importpath = path.resolve(path.dirname(filepath)+'/'+importpath);
          }
          if(grunt.file.exists(importpath)){
            var importedPathSource = grunt.file.read(importpath);

            /* check file has already not been imported */
            if(!(_fileImportMap.hasOwnProperty(importpath))){
              _fileImportMap[importpath] = matchesArray[1];
              /* check recursive imports in file */
              if(importedPathSource.search(importReg) !== -1){
                _resolvedSource = importRecursive(importpath);
                var importString = createImportString(importVarsArray, _resolvedSource, matchesArray[3]);
                newSource = newSource.replace(matchesArray[2], importString);
              }else{
                var importString = createImportString(importVarsArray, importedPathSource, matchesArray[3]);
                 newSource = newSource.replace(matchesArray[2], importString);
              }
            }else{
              /* else assign the previous import variable for new import */
              if(matchesArray[0].slice(-1) == ","){
                newSource = newSource.replace(matchesArray[2], _fileImportMap[importpath]+",");
              }else if(matchesArray[0].slice(-1) == ";"){
                newSource = newSource.replace(matchesArray[2], _fileImportMap[importpath]+";");
              }else{
                newSource = newSource.replace(matchesArray[2], _fileImportMap[importpath]);
              }
            }
          }else{
            grunt.log.warn('_import file "' + importpath + '" not found.');
          }
        }
        return newSource;
     };

    var resolvedSource = importRecursive(fileDetails.src);
    // Write the destination file.
    grunt.file.write(fileDetails.dest, resolvedSource);

    // Print a success message.
    grunt.log.writeln('File "' + fileDetails.dest + '" created.');
  });
};
