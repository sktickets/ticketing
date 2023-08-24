import {BaseListener, Subjects, TicketCreatedEvent} from "@sktickets/common";
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import {Ticket} from "../../models/ticket";

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data;
        const ticket = Ticket.build({
            id,
            title,
            price,
        });
        await ticket.save();

        msg.ack();
    }
}
