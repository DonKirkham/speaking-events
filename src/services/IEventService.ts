/* eslint-disable */
import { ISpeakingEvent } from '../models/ISpeakingEvent';

export interface IEventService {
  getData(): Promise<ISpeakingEvent[]>;
  addEvent(newEvent: ISpeakingEvent): Promise<any>;
}