FROM node:22-alpine
RUN apk add --no-cache git nginx

WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

WORKDIR /backend
RUN git clone https://github.com/mursel05/FastChat-back.git .
RUN npm install 

EXPOSE 80
CMD ["/start.sh"]