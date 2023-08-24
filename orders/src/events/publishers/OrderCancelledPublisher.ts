import {BasePublisher, OrderCancelledEvent, Subjects } from "@sktickets/common";

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
