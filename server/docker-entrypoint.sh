#!/bin/sh

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
sleep 10

# Run the seeder
echo "Seeding the database..."
node seeder.js

# Start the application
echo "Starting the application..."
npm start 