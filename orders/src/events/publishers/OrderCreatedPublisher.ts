import { BasePublisher, Subjects, OrderCreatedEvent } from "@sktickets/common";

export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
