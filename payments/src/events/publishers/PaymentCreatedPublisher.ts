import {BasePublisher, Subjects, OrderCreatedEvent, PaymentCreatedEvent} from "@sktickets/common";

export class PaymentCreatedPublisher extends BasePublisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
