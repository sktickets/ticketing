import { BasePublisher, Subjects, TicketUpdatedEvent } from "@sktickets/common";

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
