
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rodrigonplacido1:123123456456@nutriplanner.f4mjfxq.mongodb.net/nutriplanner?appName=NutriPlanner';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB (Atlas)');

        const collection = mongoose.connection.collection('users');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

        for (const idx of indexes) {
            if (idx.unique && idx.name !== '_id_' && idx.name !== 'id_1') {
                console.log(`Dropping unique index: ${idx.name}`);
                await collection.dropIndex(idx.name);
                console.log(`Dropped ${idx.name}`);
            }
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
