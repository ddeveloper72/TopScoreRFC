// Simple MongoDB Schema Update for TopScoreRFC
// Copy and paste this into MongoDB Compass or your MongoDB shell

// Update these values for your database
const DATABASE_NAME = "topscorerfcDB"; // Change to your database name
const COLLECTION_NAME = "matches";     // Change to your collection name

// Use your database
use(DATABASE_NAME);

// Execute the schema update
db.runCommand({
    collMod: COLLECTION_NAME,
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
                        name: {
                            bsonType: 'string'
                        },
                        address: {
                            bsonType: 'string'
                        },
                        coordinates: {
                            bsonType: 'object',
                            properties: {
                                lat: {
                                    bsonType: 'double',
                                    minimum: -90,
                                    maximum: 90
                                },
                                lng: {
                                    bsonType: 'double',
                                    minimum: -180,
                                    maximum: 180
                                }
                            }
                        },
                        placeId: {
                            bsonType: 'string'
                        },
                        formattedAddress: {
                            bsonType: 'string'
                        }
                    }
                },
                competition: {
                    bsonType: 'string'
                },
                status: {
                    enum: ['scheduled', 'completed', 'cancelled']
                },
                homeScore: {
                    bsonType: 'int',
                    minimum: 0
                },
                awayScore: {
                    bsonType: 'int',
                    minimum: 0
                },
                referee: {
                    bsonType: 'string'
                },
                weather: {
                    bsonType: 'string'
                },
                notes: {
                    bsonType: 'string'
                },
                photos: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'string'
                    }
                }
            }
        }
    },
    validationLevel: "moderate",
    validationAction: "warn"
});

print("✅ Schema updated successfully!");
print("New fields supported:");
print("- matchType: boys, girls, mixed");
print("- homeTeamCategory: minis, youths-boys, girls, seniors, womens-tag");
print("- homeTeamAgeLevel & awayTeamAgeLevel");
print("- Enhanced venue details");
print("Your matches will now save with all new fields!");
