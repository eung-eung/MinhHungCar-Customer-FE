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

# Install expect for automating expo login
RUN apt-get update && apt-get install -y expect

# Copy the expo-login script
COPY expo-login.sh /app/

# Make the script executable
RUN chmod +x /app/expo-login.sh

# Expose the port that Expo uses
EXPOSE 19006 19007 19008

# Start the Expo project after logging in
CMD ["sh", "-c", "/app/expo-login.sh && npx expo start --tunnel"]
