import {BasePublisher, ExpirationCompleteEvent, Subjects} from "@sktickets/common";

export class ExpirationCompletePublisher extends BasePublisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
