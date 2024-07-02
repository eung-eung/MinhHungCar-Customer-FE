# Use a Node.js base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies globally
RUN npm install -g expo-cli @expo/ngrok

# Install project dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Expose the port that Expo uses
EXPOSE 19006 19007 19008

# Start the Expo project
CMD ["npx", "expo", "start", "--tunnel"]
