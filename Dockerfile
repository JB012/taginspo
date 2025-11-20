# Use the latest LTS version of Node.js
FROM node:24.11-alpine

ARG VITE_CLERK_PUBLISHABLE_KEY

ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}

# Set the working directory inside the container
WORKDIR /app
 
# Copy package.json and package-lock.json
COPY ./client/package*.json .
 
# Install dependencies
RUN npm install
 
# Copy the rest of your application files
COPY ./client .
 
# Expose the port your app runs on
EXPOSE 5173
 
# Define the command to run your app
CMD ["npm", "run", "dev"]