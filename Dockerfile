FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install Node dependencies and concurrently
RUN cd Frontend && npm install && npm install concurrently

# Install Python dependencies
RUN cd Backend && pip3 install -r requirements.txt

# Expose frontend port
EXPOSE 3000

# Start both frontend and backend
CMD ["npm", "start"]
