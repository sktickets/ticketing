import { connect } from 'node-nats-streaming';
import {TicketCreatedPublisher} from "./events/TicketCreatedPublisher";

console.clear();

const stan = connect('ticketing', 'abc', {
    url: 'https://localhost:4222'
});

stan.on('connect', async () => {
    console.log('Publisher connected to NATS');

    const publisher = new TicketCreatedPublisher(stan);

    await publisher.publish({
        id: 'fd',
        title: 'concert',
        price: 20,
        userId: '23124124'
    });
});
