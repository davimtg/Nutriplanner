import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rodrigonplacido1:123123456456@nutriplanner.f4mjfxq.mongodb.net/nutriplanner?appName=NutriPlanner';

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        const collection = mongoose.connection.collection('users');

        // Try to drop email_1 explicitly if users want it
        try {
            await collection.dropIndex('email_1');
            console.log('Index email_1 removido com sucesso.');
        } catch (error) {
            console.log('Index email_1 não existe ou erro ao remover especificamente.');
        }

        const indexes = await collection.indexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

        for (const idx of indexes) {
            if (idx.unique && idx.name !== '_id_' && idx.name !== 'id_1') {
                console.log(`Dropping unique index: ${idx.name}`);
                await collection.dropIndex(idx.name);
                console.log(`Dropped ${idx.name}`);
            }
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
