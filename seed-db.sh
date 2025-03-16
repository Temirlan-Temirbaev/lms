#!/bin/bash

echo "Seeding the database..."
docker compose exec server node seeder.js

echo "Database seeded successfully!" 