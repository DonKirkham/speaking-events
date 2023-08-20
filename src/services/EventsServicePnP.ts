/* eslint-disable */
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ISpeakingEvent } from '../models/ISpeakingEvent';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFx } from "@pnp/sp";
//import { spfi } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IEventService } from './IEventService';


export class EventServicePnP implements IEventService {
  private _sp: any;
  private _listName: string;

  constructor(context: WebPartContext, siteUrl: string, listName: string) {
    console.log("EventsServicePnP.constructor() called", { context, siteUrl, listName });
    this._sp = spfi(`${siteUrl}`).using(SPFx(context));
    this._listName = listName;
  }

  public getData = async (): Promise<ISpeakingEvent[]> => {
    console.log("getData() called");
    const _eventsSP = await this._sp.web.lists.getByTitle(`${this._listName}`).items.select("Id, Title, Session, SessionDate").orderBy("SessionDate", false)();
    const _events: ISpeakingEvent[] = _eventsSP.map((item: any) => {
      return {
        id: item.Id,
        EventName: item.Title,
        Session: item.Session,
        SessionDate: new Date(item.SessionDate)
      };
    });
    console.log("getData() returning data", _events);
    return _events;
  }

  public addEvent = async (newEvent: ISpeakingEvent) => {
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

}