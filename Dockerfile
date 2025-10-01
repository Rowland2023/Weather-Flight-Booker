# Use a base image with Node and Python
FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install Node dependencies
RUN npm install

# Install Python dependencies
RUN pip3 install -r backend/requirements.txt

# Start both frontend and backend
CMD ["npx", "concurrently", "npm run node", "npm run flask"]
