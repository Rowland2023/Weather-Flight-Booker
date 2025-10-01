# Use the official Node image as the base
FROM node:18-bullseye

# Set the working directory
WORKDIR /app/Frontend

# Copy the package.json and package-lock.json
COPY Frontend/package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of the frontend code
COPY Frontend .

# Expose the port (e.g., 3000)
EXPOSE 3000

# Start the Node server (which is the proxy)
# This executes: "node index.js"
CMD ["npm", "start"]
