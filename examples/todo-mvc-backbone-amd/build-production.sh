# Build file that do the job of optimizing all require.js files to the one 
# that will be production-ready (Loading a lot of files on production results in poor user experience)
#
# In order for this script to work you need to have node modules 'react-tools' and 'requirejs' installed
# For installing them globally to your system use 'npm install -g react-tools' and 'npm install -g requirejs'

# clean temp directories and prepare structure for the build
rm -rf built
rm -rf temp_build
mkdir temp_build
# copy code to be modified by jsx processor and r.js optimizer
cp -r js temp_build
# process it with jsx precompiler. All the files that need to be processed must have '/** @jsx React.DOM */' at the top of the file
jsx temp_build/ temp_build/ # output new files into the same directory

# build r.js 
cd temp_build/js
r.js -o build.js
# output will be over here: temp_build/app.js. This file will contain all libraries and everything we need to prepare a production package

# prepare production package in the built directory. Don't forget any static resources you have/css/etc.
cd ../../
mkdir built
mkdir built/js
mkdir built/js/libs
cp temp_build/webapp-build/app.js built/js/
cp js/libs/require.js built/js/libs/
cp -r css built
# and copy of course new html with correct bindings
cp index.optimized.html built/index.html

# clean up
rm -rf temp_build
