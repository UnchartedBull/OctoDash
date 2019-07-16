#!/bin/sh

make_version() {
  # git checkout -- .
  # git status
  COMMIT=$(git log -1 --pretty=%B)
  echo $COMMIT
  # npm version patch -m "bump version to %s [skip ci]"
}

upload_files() {
  git push origin HEAD:$TRAVIS_BRANCH
  git push --tags
}

make_version
# upload_files