/* eslint-disable */
import { ISpeakingEvent } from '../models/ISpeakingEvent';

export interface IEventService {
  GetEvents(eventsToDisplay?: number): Promise<ISpeakingEvent[]>;
  AddEvent(newEvent: ISpeakingEvent): Promise<any>;
  UpdateEvent(event: ISpeakingEvent): Promise<any>;
  DeleteEvent(eventId: string): Promise<any>;
}