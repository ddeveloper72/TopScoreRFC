// MongoDB Schema Update Script
// Run this in MongoDB Compass or mongosh

use('task_manager');

// Drop the existing validation (if any)
db.runCommand({
  collMod: "matches",
  validator: {}
});

// Apply the new, more comprehensive validation schema
db.runCommand({
  collMod: "matches",
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        'homeTeam',
        'awayTeam',
        'date',
        'venue',
        'status'
      ],
      properties: {
        _id: {
          bsonType: ['objectId', 'string']
        },
        id: {
          bsonType: 'string'
        },
        matchType: {
          bsonType: 'string',
          enum: ['boys', 'girls', 'mixed']
        },
        homeTeam: {
          bsonType: 'string',
          minLength: 1
        },
        homeTeamCategory: {
          bsonType: 'string',
          enum: ['minis', 'youths-boys', 'girls', 'seniors', 'womens-tag']
        },
        homeTeamAgeLevel: {
          bsonType: 'string'
        },
        awayTeam: {
          bsonType: 'string',
          minLength: 1
        },
        awayTeamAgeLevel: {
          bsonType: 'string'
        },
        date: {
          bsonType: 'date'
        },
        venue: {
          bsonType: 'string',
          minLength: 1
        },
        venueDetails: {
          bsonType: 'object',
          properties: {
            name: { bsonType: 'string' },
            address: { bsonType: 'string' },
            coordinates: {
              bsonType: 'object',
              properties: {
                lat: { bsonType: ['double', 'int'], minimum: -90, maximum: 90 },
                lng: { bsonType: ['double', 'int'], minimum: -180, maximum: 180 }
              }
            },
            placeId: { bsonType: 'string' },
            formattedAddress: { bsonType: 'string' }
          }
        },
        competition: {
          bsonType: 'string'
        },
        status: {
          bsonType: 'string',
          enum: ['scheduled', 'completed', 'cancelled']
        },
        homeScore: {
          bsonType: ['int', 'double', 'long'],
          minimum: 0
        },
        awayScore: {
          bsonType: ['int', 'double', 'long'],
          minimum: 0
        },
        // Mongoose timestamp fields
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        },
        // Mongoose version key
        __v: {
          bsonType: ['int', 'double', 'long']
        }
      }
    }
  },
  validationLevel: "moderate", // Allow updates to existing documents that don't match
  validationAction: "warn"     // Log warnings instead of rejecting documents
});

console.log("✅ MongoDB schema validation updated successfully!");
console.log("📋 New features:");
console.log("  - Added support for Mongoose timestamps (createdAt, updatedAt)");
console.log("  - Added __v version key support");
console.log("  - More flexible number types for scores and coordinates");
console.log("  - Moderate validation level (won't break existing docs)");
console.log("  - Warn validation action (logs issues instead of rejecting)");
