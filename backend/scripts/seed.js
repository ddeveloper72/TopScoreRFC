/*
 Seed script to insert a sample Match document into MongoDB.
 Uses the same DB connection config as the server.
*/

const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Match = require('../models/Match');

async function run() {
    try {
        await connectDB();
        // Confirm DB and collection
        const dbName = mongoose.connection.name;
        const collName = Match.collection.name;
        console.log(`Using database: ${dbName}, collection: ${collName}`);

        // Create a seed match 7 days from now
        const kickoff = new Date();
        kickoff.setDate(kickoff.getDate() + 7);
        kickoff.setHours(15, 0, 0, 0); // 15:00 local time

        const seed = {
            homeTeam: 'TopScore RFC',
            awayTeam: 'Visitors RFC',
            date: kickoff,
            venue: 'Aviva Stadium',
            competition: 'Friendly',
            status: 'scheduled',
            venueDetails: {
                name: 'Aviva Stadium',
                address: 'Lansdowne Rd, Dublin 4, Ireland',
                coordinates: { lat: 53.3351, lng: -6.2283 },
            },
        };

        // Optional: avoid duplicates by checking same teams on same day
        const dayStart = new Date(kickoff);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(kickoff);
        dayEnd.setHours(23, 59, 59, 999);

        const existing = await Match.findOne({
            homeTeam: seed.homeTeam,
            awayTeam: seed.awayTeam,
            date: { $gte: dayStart, $lte: dayEnd },
        });

        if (existing) {
            console.log('Seed match already exists:', existing._id.toString());
            return;
        }

        const created = await Match.create(seed);
        console.log('Seed match created with id:', created._id.toString());
    } catch (err) {
        console.error('\nFailed to seed match.');
        console.error('Error:', err.message);
        if (/not authorized|not allowed|unauthorized/i.test(err.message)) {
            console.error('\nHint: The MongoDB user may not have readWrite permissions on the target database.');
            console.error('Grant readWrite on the correct database to the user in MONGODB_URI, then retry.');
        }
        process.exitCode = 1;
    } finally {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
        } catch (_) { }
    }
}

run();
