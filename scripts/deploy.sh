if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "master" ]; then exit 0; fi

# Get to the Travis build directory, configure git and clone the repo
git config --global user.email "travis@travis-ci.org"
git config --global user.name "travis-ci"

# Commit and Push the Changes
cd build
rm -rf .git
git init
git add -f .
git commit -m "Lastest build on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
git push -fq "https://${GH_TOKEN}@github.com/CoorpAcademy/timer.git" master:gh-pages > /dev/null
