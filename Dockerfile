# Use Python + Node base image
FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install Node dependencies
RUN cd Frontend && npm install

# Install Python dependencies
RUN cd Backend && pip3 install -r requirements.txt

# Expose port
EXPOSE 3000

# Start both services
CMD ["npm", "start"]
