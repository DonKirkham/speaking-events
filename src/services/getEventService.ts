/* eslint-disable */
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IEventService } from './IEventService';
import { EventServiceREST } from './EventsServiceREST';
import { EventServicePnP } from './EventsServicePnP';

let _service: IEventService;

export const getEventService = (init ?:{ source: string, context: WebPartContext, siteUrl: string, listName: string }): IEventService => {
  if (!!init?.listName && !!init?.siteUrl && !!init?.context) {
    if (init?.source === "PnPJs")
    {
      _service = new EventServicePnP(init.context, init.siteUrl, init.listName);
      return _service;
    }
    else { 
      _service = new EventServiceREST(init.context, init.siteUrl, init.listName);
      return _service;
    }
  }
  return _service;
}