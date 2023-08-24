 import {BaseListener, ExpirationCompleteEvent, Subjects, TicketCreatedEvent} from "@sktickets/common";
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import {Order, OrderStatus} from "../../models/order";
import {OrderCancelledPublisher} from "../publishers/OrderCancelledPublisher";
import {natsWrapper} from "../../NatsWrapper";

export class ExpirationCompleteListener extends BaseListener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status === OrderStatus.Complete) {
            msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled,
        })

        await order.save();

        await new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            }
        })

        msg.ack();
    }
}
