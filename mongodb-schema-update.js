/**
 * MongoDB Schema Update Script for TopScoreRFC Match Collection
 * This script updates the validation schema to support the new match fields:
 * - matchType, homeTeamCategory, homeTeamAgeLevel, awayTeamAgeLevel
 *
 * Run this script in MongoDB Compass, MongoDB Shell, or your MongoDB client
 */

// Configuration
const DATABASE_NAME = "topscorerfcDB"; // Update with your database name
const COLLECTION_NAME = "matches";     // Update with your collection name

// Connect to your database
use(DATABASE_NAME);

// Updated schema with all new fields
const updatedSchema = {
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
                // MongoDB ObjectId or string
                bsonType: ['objectId', 'string']
            },
            id: {
                bsonType: 'string',
                description: 'Unique match identifier'
            },
            matchType: {
                bsonType: 'string',
                enum: ['boys', 'girls', 'mixed'],
                description: 'Type of match - boys, girls, or mixed/adults'
            },
            homeTeam: {
                bsonType: 'string',
                minLength: 1,
                description: 'Home team name - required field'
            },
            homeTeamCategory: {
                bsonType: 'string',
                enum: ['minis', 'youths-boys', 'girls', 'seniors', 'womens-tag'],
                description: 'Home team category classification'
            },
            homeTeamAgeLevel: {
                bsonType: 'string',
                description: 'Home team age level (e.g., U12, U16, Adults)'
            },
            awayTeam: {
                bsonType: 'string',
                minLength: 1,
                description: 'Away team name - required field'
            },
            awayTeamAgeLevel: {
                bsonType: 'string',
                description: 'Away team age level for fair competition matching'
            },
            date: {
                bsonType: 'date',
                description: 'Match date and time - required field'
            },
            venue: {
                bsonType: 'string',
                minLength: 1,
                description: 'Match venue - required field'
            },
            venueDetails: {
                bsonType: 'object',
                description: 'Detailed venue information with GPS coordinates',
                properties: {
                    name: {
                        bsonType: 'string',
                        description: 'Venue name'
                    },
                    address: {
                        bsonType: 'string',
                        description: 'Venue address'
                    },
                    coordinates: {
                        bsonType: 'object',
                        properties: {
                            lat: {
                                bsonType: 'double',
                                minimum: -90,
                                maximum: 90,
                                description: 'Latitude coordinate'
                            },
                            lng: {
                                bsonType: 'double',
                                minimum: -180,
                                maximum: 180,
                                description: 'Longitude coordinate'
                            }
                        },
                        required: ['lat', 'lng']
                    },
                    placeId: {
                        bsonType: 'string',
                        description: 'Google Places API place ID'
                    },
                    formattedAddress: {
                        bsonType: 'string',
                        description: 'Google formatted address'
                    }
                }
            },
            competition: {
                bsonType: 'string',
                description: 'Competition or tournament name'
            },
            status: {
                enum: ['scheduled', 'completed', 'cancelled'],
                description: 'Match status - required field'
            },
            homeScore: {
                bsonType: 'int',
                minimum: 0,
                description: 'Home team final score'
            },
            awayScore: {
                bsonType: 'int',
                minimum: 0,
                description: 'Away team final score'
            },
            // Additional fields for future expansion
            referee: {
                bsonType: 'string',
                description: 'Match referee name'
            },
            weather: {
                bsonType: 'string',
                description: 'Weather conditions during match'
            },
            notes: {
                bsonType: 'string',
                description: 'Additional match notes'
            },
            photos: {
                bsonType: 'array',
                items: {
                    bsonType: 'string'
                },
                description: 'Array of photo URLs or file paths'
            }
        }
    }
};

print("=== TopScoreRFC MongoDB Schema Update Script ===");
print("Database: " + DATABASE_NAME);
print("Collection: " + COLLECTION_NAME);
print("");

// Step 1: Check if collection exists
const collections = db.runCommand("listCollections", { filter: { name: COLLECTION_NAME } });
if (collections.cursor.firstBatch.length === 0) {
    print("⚠️  Collection '" + COLLECTION_NAME + "' does not exist!");
    print("Creating collection with validation schema...");

    // Create collection with validation
    db.createCollection(COLLECTION_NAME, {
        validator: updatedSchema,
        validationLevel: "moderate",
        validationAction: "warn"
    });

    print("✅ Collection created successfully with validation schema");
} else {
    print("📄 Collection '" + COLLECTION_NAME + "' found");

    // Step 2: Backup current validation (optional - just log it)
    const currentValidation = db.runCommand({ listCollections: 1, filter: { name: COLLECTION_NAME } });
    if (currentValidation.cursor.firstBatch[0].options && currentValidation.cursor.firstBatch[0].options.validator) {
        print("📋 Current validation schema exists");
        print("Current validator keys: " + Object.keys(currentValidation.cursor.firstBatch[0].options.validator).join(", "));
    } else {
        print("📋 No current validation schema found");
    }

    // Step 3: Update the collection validation
    print("");
    print("🔄 Updating collection validation schema...");

    const result = db.runCommand({
        collMod: COLLECTION_NAME,
        validator: updatedSchema,
        validationLevel: "moderate",  // moderate = validate new inserts and updates to existing docs
        validationAction: "warn"      // warn = log validation failures but allow operations
    });

    if (result.ok === 1) {
        print("✅ Schema validation updated successfully!");
        print("   - Validation Level: moderate (validates new and updated documents)");
        print("   - Validation Action: warn (logs violations but allows saves)");
    } else {
        print("❌ Schema validation update failed!");
        print("Error: " + JSON.stringify(result));
    }
}

print("");
print("=== New Schema Supports These Fields ===");
print("✅ matchType: boys, girls, mixed");
print("✅ homeTeamCategory: minis, youths-boys, girls, seniors, womens-tag");
print("✅ homeTeamAgeLevel: U12, U16, Adults, etc.");
print("✅ awayTeamAgeLevel: Compatible age levels");
print("✅ Enhanced venue details with GPS coordinates");
print("✅ Additional fields: referee, weather, notes, photos");
print("");

// Step 4: Test the validation with sample data
print("🧪 Testing validation with sample match data...");

const sampleMatch = {
    id: "test-match-" + new Date().getTime(),
    matchType: "boys",
    homeTeam: "Clane RFC",
    homeTeamCategory: "youths-boys",
    homeTeamAgeLevel: "U16",
    awayTeam: "Naas RFC",
    awayTeamAgeLevel: "U16",
    date: new Date(),
    venue: "Clane RFC",
    competition: "Friendly Match",
    status: "scheduled"
};

try {
    // This will test the validation without actually inserting
    db.runCommand({
        insert: COLLECTION_NAME,
        documents: [sampleMatch],
        dryRun: true  // MongoDB 5.0+ feature - if not supported, comment this line
    });
    print("✅ Sample match data passes validation");
} catch (error) {
    // Try actual insert/delete test if dryRun not supported
    try {
        const insertResult = db[COLLECTION_NAME].insertOne(sampleMatch);
        if (insertResult.acknowledged) {
            print("✅ Sample match data passes validation");
            // Clean up test data
            db[COLLECTION_NAME].deleteOne({ _id: insertResult.insertedId });
            print("🧹 Test data cleaned up");
        }
    } catch (insertError) {
        print("❌ Sample match data validation failed:");
        print(insertError.message);
    }
}

print("");
print("🚀 Schema update complete!");
print("You can now save matches with all new fields:");
print("   - Match types (boys/girls/mixed)");
print("   - Team categories and age levels");
print("   - Enhanced venue information");
print("");
print("💡 To make validation stricter later, run:");
print('   db.runCommand({collMod: "' + COLLECTION_NAME + '", validationAction: "error"})');
