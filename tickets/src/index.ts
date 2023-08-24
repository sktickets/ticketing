import mongoose from "mongoose";
import {app} from "./app";
import {natsWrapper} from "./NatsWrapper";
import {OrderCreatedListener} from "./events/listeners/OrderCreatedListener";
import {OrderCancelledListener} from "./events/listeners/OrderCancelledListener";

const start = async () => {
    const {
        JWT_KEY,
        MONGO_URI,
        NATS_URL,
        NATS_CLUSTER_ID,
        NATS_CLIENT_ID,
    } = process.env;

    if (!JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    if (!MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    if (!NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }

    if (!NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined');
    }

    if (!NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined');
    }

    try {
        await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID,  NATS_URL);

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        await mongoose.connect( MONGO_URI);
        console.log('Connected to MongoDb');
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log('Listening in port 3000');
    });
}

void start();
