FROM node
RUN mkdir /src
WORKDIR /src
ADD package.json /src/
RUN npm install
EXPOSE 8000
ADD . /src
ENTRYPOINT ["npm"]
CMD ["start"]
