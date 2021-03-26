SHELL := /bin/bash

DOCKER_IMAGE_NAME="octodash/build"

export

all:
	mkdir -p package && \
	docker build \
		-t ${DOCKER_IMAGE_NAME} . && \
	docker run -it --rm \
		-v "${PWD}":/src:ro \
		-v "${PWD}/package":/package \
		${DOCKER_IMAGE_NAME}

build-internal:
	npm run pack

clean:
