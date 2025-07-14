import { EventId } from './event-id.type';

export type MessageEntry<T> = {
  message: string;
  payload?: T;
  eventId: EventId;
  context: string;
};
