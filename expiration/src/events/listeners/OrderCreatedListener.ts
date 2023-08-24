import {BaseListener, OrderCreatedEvent, Subjects} from "@sktickets/common";
import {queueGroupName} from "./queueGroupName";
import { Message } from 'node-nats-streaming';
import {expirationQueue} from "../../queues/ExpirationQueue";

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message ) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

        await expirationQueue.add({
            orderId: data.id,
        }, {
            delay,
        })

        msg.ack();
    }
}
