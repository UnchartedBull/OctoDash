FROM debian:latest

#TODO: Use version from package.json?
ENV NODE_VERSION 14.15.4
ENV NVM_DIR /usr/local/nvm


RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    devscripts \
    debhelper \
    dh-systemd \
    jq \
    python3-pip \
    apt-transport-https \
    build-essential \
    ca-certificates \
    curl \
    git \
    libssl-dev \
    wget \
    rsync


RUN pip3 install yq

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN mkdir $NVM_DIR

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

CMD rsync -av /src/ /build --exclude "package/" \
    && cd /build \
    && make build-internal \
    && BUILD_TIMESTAMP=$(date +%s) \
    && cp -rv "/build/package" "/package/${BUILD_TIMESTAMP}"
