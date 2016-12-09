module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        import: {
          options: {
            src: "importFolder/finalFile.js",
            dest: "generatedFolder/js/combined.js"
          }
        },
        uglify: {
            dist : {
                files: [{
                    src: "generatedFolder/js/combined.js",
                    dest: "generatedFolder/js/combined.min.js"
                }]
            }
        },
      });
  grunt.loadTasks("import-task");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.registerTask("default", ["import", "uglify"]);
};
