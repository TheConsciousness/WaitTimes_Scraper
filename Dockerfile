FROM node:8
WORKDIR /usr/bin/node_waittimes
COPY package.json /usr/bin/node_waittimes
RUN npm install
COPY . /usr/bin/node_waittimes
ENTRYPOINT node GetDisneyTimes.js

