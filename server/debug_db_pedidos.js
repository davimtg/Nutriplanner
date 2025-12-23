import { connectDB } from './src/config/db.js';
import { Pedido } from './src/models/Moldes.js';

async function run() {
    await connectDB();
    const pedidos = await Pedido.find({});
    console.log(JSON.stringify(pedidos, null, 2));
    process.exit(0);
}

run();
