import {OrderCreatedListener} from "../OrderCreatedListener";
import {natsWrapper} from "../../../NatsWrapper";
import {Ticket} from "../../../models/ticket";
import {OrderCancelledEvent, OrderCreatedEvent, OrderStatus} from "@sktickets/common";
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import {OrderCancelledListener} from "../OrderCancelledListener";


const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create and save a ticket
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'qsdf',
    });
    ticket.set({ orderId });
    await ticket.save();

    // Create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, msg, orderId };
}

it('updates the ticket, publishes an event, and acks the message', async () => {
    const { listener, ticket, data, msg, orderId } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
