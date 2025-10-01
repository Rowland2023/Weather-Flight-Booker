# Use the official Node image as the base
FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory
WORKDIR /app

# Copy all files
COPY . .

# Install Node dependencies
RUN npm install

# Ensure concurrently is executable
RUN chmod +x node_modules/.bin/concurrently

# Install Python dependencies
RUN pip3 install -r Backend/requirements.txt

# Expose the frontend port
EXPOSE 3000

# Start both Node and Flask servers
CMD ["npm", "start"]
