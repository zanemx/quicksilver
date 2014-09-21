# SAVE TO GIT 
clear
echo "****pusing to git***"
git add .
git commit -a -m 'auto commit'
git push origin develop

echo "****minifiying***"
rm -rf dist
mkdir dist
mkdir dist/static
mkdir dist/static/app
r.js -o app.build.js

# CLEAN UP
# REMOVE CSS FILES
echo "****cleaning dirs***"
cd dist/static/app/css 
mv main.css main.css.keep
mv reset.css reset.css.keep
# mv unsemantic-grid-mobile.css unsemantic-grid-mobile.css.keep
mv unsemantic-grid-responsive-tablet-no-ie7.css unsemantic-grid-responsive-tablet-no-ie7.css.keep
mv heroes.css heroes.css.keep
mv icons.css icons.css.keep
rm *.css
mv main.css.keep main.css
mv reset.css.keep reset.css
# mv unsemantic-grid-mobile.css.keep unsemantic-grid-mobile.css
mv unsemantic-grid-responsive-tablet-no-ie7.css.keep unsemantic-grid-responsive-tablet-no-ie7.css
mv heroes.css.keep heroes.css
mv icons.css.keep icons.css

# REMOVE UNUSED SCRIPTS
cd ../scripts
mv vendor/requirejs/require.js require.js 
rm -rf collections models templates utils views vendor
mkdir vendor
mkdir vendor/requirejs/
mv require.js vendor/requirejs/
rm router.js

cd ..
rm index.html build.txt questmaker.html

# ADD PYTHON FILES 
cd ../../..
cp app.yaml dist
cp favicon.ico dist
cp index.html dist
cp feedback.html dist
cp questmaker.html dist
cp main.py dist
cp favicon.ico dist

mkdir dist/core
cp -R core dist



clear
echo "****uploading app****"
cd dist
appcfg.py --email=zanemx@gmail.com --passin update ./

clear
echo "****upload complete****"


clear 
echo "****clearing datastore****"
curl -d "action=clearDatastore" quicksilver-p12.appspot.com/ajax

clear 

cd ..

echo "****removing dist dir****"
rm -rf dist

clear
echo "****build complete****"


