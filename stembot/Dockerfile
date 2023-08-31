# Use the official Node.js 14 image as the base image
FROM node:14

RUN npm i whatsapp-web.js

# Install libnss3 package
RUN apt-get update && apt-get install -y libnss3

RUN apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget


# Set the working directory inside the container
WORKDIR /usr/src/app

RUN npm i qrcode-terminal


# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# # Build the TypeScript code
# RUN npm run build
# RUN node app.js

# Expose the port the app will run on
EXPOSE 3000

# Start the Express server
CMD ["npm", "start"]