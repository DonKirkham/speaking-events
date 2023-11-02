/* eslint-disable */
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISpeakingEvent } from '../models/ISpeakingEvent';
import { IEventService } from './IEventService';
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";


export class EventServicePnP implements IEventService {
  private _sp: any;
  private _listName: string;

  constructor(context: WebPartContext, siteUrl: string = "", listName: string = "") {
    console.log("EventsServicePnP.constructor() called", { context, siteUrl, listName });
    this._sp = spfi(`${siteUrl}`).using(SPFx(context));
    this._listName = listName!;
  }

  public GetEvents = async (eventsToDisplay?: number): Promise<ISpeakingEvent[]> => {
    console.log("GetEvents(PnP) called", { eventsToDisplay: eventsToDisplay });
    const _eventsSP = await this._sp.web.lists.getByTitle(`${this._listName}`).items.select("Id, Title, Session, SessionDate").top(eventsToDisplay ?? 5000).orderBy("SessionDate", false)();
    const _events: ISpeakingEvent[] = _eventsSP.map((item: any) => {
      return {
        id: item.Id,
        EventName: item.Title,
        Session: item.Session,
        SessionDate: new Date(item.SessionDate)
      };
    });
    console.log("GetEvents(PnP) return", _events);
    return _events;
  }

  public AddEvent = async (newEvent: ISpeakingEvent) => {
    console.log("addEvent() called", { newEvent });
    const _result = this._sp.web.lists.getByTitle("Speaking Events").items.add(
      {
        Title: newEvent.EventName,
        Session: newEvent.Session + "(PnPJs)",
        SessionDate: newEvent.SessionDate?.toISOString(),
        SessionType: "60 minute session"
      }
    );
    return _result;
  }

  public UpdateEvent = async (event: ISpeakingEvent): Promise<any> => {
    console.log("updateEvent() called", { event });
    const _result = this._sp.web.lists.getByTitle("Speaking Events").items.getById(event.id)
      .update(
        {
          Title: event.EventName,
          Session: event.Session,
          SessionDate: event.SessionDate?.toISOString()
        }
      );
    return _result;
  }

  public DeleteEvent = async (eventId: string): Promise<void> => {
    console.log("deleteEvent() called", { eventId });
    const _result = this._sp.web.lists.getByTitle("Speaking Events").items.getById(eventId)
      .delete();
    return _result;
  }

}