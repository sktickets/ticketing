import { Message } from 'node-nats-streaming';
import { BaseListener, Subjects, TicketCreatedEvent } from '@sktickets/common';

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data', data);

    msg.ack();
  }
}
