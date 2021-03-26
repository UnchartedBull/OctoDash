#!/bin/bash
set -e

cd "$(dirname "$0")"


VERSION=$(yq -c -M .version ../package.json | tr -d \")
ARCHS=$(jq ".build.linux.target[0].arch[]" ../package.json | tr -d \")

#hack for amd64
ARCHS=$(echo "${ARCHS}" | sed 's/x64/amd64/g')
if [[ ( ! -L ../package/linux-amd64-unpacked ) && ( -d ../package/linux-unpacked ) ]]
then
	ln -s ../package/linux-unpacked ../package/linux-amd64-unpacked
fi


for ARCH in `echo ${ARCHS}`
do
	PACKAGE="linux-${ARCH}-unpacked"

	TMP_DIR=$(mktemp -d)
	BUILD_DIR="${TMP_DIR}/build"

	mkdir -p "${BUILD_DIR}"


	cp -prv debian "${BUILD_DIR}/debian"
	cp -prv "../package/${PACKAGE}/" "${BUILD_DIR}/"
	mv "${BUILD_DIR}/${PACKAGE}" "${BUILD_DIR}/package"

	pushd $BUILD_DIR

	sed -i "s:{version}:$VERSION:g;" debian/changelog
	#sed -i "s:{arch}:$ARCH:g;" debian/control

	#debuild -b
	debuild -b -uc -us

	popd
	find "${TMP_DIR}" -maxdepth 1 -type f -name "*.deb" -exec cp -f "{}" "../package/octodash-${VERSION}-${ARCH}.deb" \;
	rm -rf "${TMP_DIR}"

done
