import { BasePublisher, Subjects, TicketCreatedEvent } from "@sktickets/common";

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
