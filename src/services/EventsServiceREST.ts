/* eslint-disable */
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ISpeakingEvent } from '../models/ISpeakingEvent';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IEventService } from './IEventService';

export class EventServiceREST  {
  private _spHttpClient: SPHttpClient;
  private _siteUrl: string;
  private _listName: string;

  constructor(context: WebPartContext, siteUrl: string, listName: string) {
    console.log("EventsServiceREST.constructor() called", { context, siteUrl, listName });
    this._spHttpClient = context?.spHttpClient;
    this._siteUrl = siteUrl;
    this._listName = listName;
  }

  public GetEvents = async (eventsToDisplay: number): Promise<ISpeakingEvent[]> => {
    console.log("GetEvents(REST) called");
    const _url = new URL(`${this._siteUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Title,SessionDate,Session,SessionType&$top=${eventsToDisplay ?? 5000}&$orderBy=SessionDate desc`).href
    const _requestOptions = {
      headers: {
        'ACCEPT': 'application/json; odata.metadata=none'
      }
    }
    const _response: SPHttpClientResponse = await this._spHttpClient.get(_url, SPHttpClient.configurations.v1, _requestOptions);
    const _responseJson = await _response.json();
    const _events: ISpeakingEvent[] = _responseJson.value.map((item: any) => {
      return {
        id: item.Id,
        EventName: item.Title,
        Session: item.Session,
        SessionDate: new Date(item.SessionDate)
      };
    });
    console.log("GetEvents(REST) return", _events);
    return _events;
  }

  public GetUpcomingEvents = async (eventsToDisplay: number): Promise<ISpeakingEvent[]> => {
    console.log("GetEvents(REST) called");
    const _url = new URL(`${this._siteUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Title,SessionDate,Session,SessionType&$filter=SessionDate ge datetime'${new Date().toISOString().split("T")[0]}T00:00:00.000Z'&$top=${eventsToDisplay ?? 5000}&$orderBy=SessionDate`).href
    const _requestOptions = {
      headers: {
        'ACCEPT': 'application/json; odata.metadata=none'
      }
    }
    const _response: SPHttpClientResponse = await this._spHttpClient.get(_url, SPHttpClient.configurations.v1, _requestOptions);
    const _responseJson = await _response.json();
    const _events: ISpeakingEvent[] = _responseJson.value.map((item: any) => {
      return {
        id: item.Id,
        EventName: item.Title,
        Session: item.Session,
        SessionDate: new Date(item.SessionDate)
      };
    });
    console.log("GetEvents(REST) return", _events);
    return _events;
  }

  private _getItemEntityType = async (): Promise<string> => {
    return this._spHttpClient.get(
      `${this._siteUrl}/_api/web/lists/getbytitle('${this._listName}')?$select=ListItemEntityTypeFullName`,
      SPHttpClient.configurations.v1)
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse.ListItemEntityTypeFullName;
      }) as Promise<string>;
  }

  public AddEvent = async (newEvent: ISpeakingEvent) => {
    console.log("AddEvent(REST) called", { newEvent });
    const _url: string = `${this._siteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
    const _itemEntityType: string = await this._getItemEntityType();
    const _result: SPHttpClientResponse = await this._spHttpClient.post(_url, SPHttpClient.configurations.v1,
      {
        body: JSON.stringify({
          Title: newEvent.EventName,
          Session: newEvent.Session+"(REST)",
          SessionDate: newEvent.SessionDate?.toISOString(),
          SessionType: "60 minute session",
          '@odata.type': _itemEntityType
        })
      });
    return _result;
  }

  public UpdateEvent = async (event: ISpeakingEvent): Promise<any> => {
    console.log("UpdateEvent(REST) called", { event });
    const _url: string = `${this._siteUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${event.id})`;
    const _itemEntityType: string = await this._getItemEntityType();
    const _result: SPHttpClientResponse = await this._spHttpClient.post(_url, SPHttpClient.configurations.v1,
      {
        body: JSON.stringify({
          Title: event.EventName,
          Session: event.Session,
          SessionDate: event.SessionDate?.toISOString(),
          '@odata.type': _itemEntityType,
          '@odata.etag': '*'
        }),
        headers: {
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE'
        }
      });
    return _result;
  }

  public DeleteEvent = async (eventId: string): Promise<any> => {
    console.log("DeleteEvent(REST) called", { eventId });
    const _url: string = `${this._siteUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${eventId})`;
    const _result: SPHttpClientResponse = await this._spHttpClient.post(_url, SPHttpClient.configurations.v1,
      {
        headers: {
          'IF-MATCH': '*',
          'X-HTTP-Method': 'DELETE'
        }
      });
    return _result;
  }


}