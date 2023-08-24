import {BaseListener, OrderCancelledEvent, OrderCreatedEvent, Subjects} from "@sktickets/common";
import { Message } from 'node-nats-streaming'
import {queueGroupName} from "./queueGroupName";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/TicketUpdatedPublisher";

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, throw error
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Mark the ticket as being reserved by setting its orderId property
        ticket.set({ orderId: undefined });

        // Save the ticket
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version,
        });

        // ack the message
        msg.ack();
    }
}

