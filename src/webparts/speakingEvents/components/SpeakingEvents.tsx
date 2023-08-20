/* eslint-disable */
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './SpeakingEvents.module.scss';
import { escape, set } from '@microsoft/sp-lodash-subset';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISpeakingEvents as ISpeakingEvent } from '../../../models/SpeakingEvents';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { spfi, SPFx } from "@pnp/sp";
//import { spfi } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

//globals

export interface ISpeakingEventsProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext
}

export const SpeakingEvents: React.FC<ISpeakingEventsProps> = (props) => {
  const {
    description,
    isDarkTheme,
    environmentMessage,
    hasTeamsContext,
    userDisplayName,
    context
  } = props;

  const [counter, setCounter] = useState<number>(0);
  const [oddEven, setOddEven] = useState<string>('');
  const [events, setEvents] = useState<ISpeakingEvent[]>([]);

  const getDataREST = async (): Promise<ISpeakingEvent[]> => {
    console.log("getDataREST() called");
    const _url = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items?$select=Id,Title,Session,SessionDate&$orderby=SessionDate%20desc";
    const _requestOptions = {
      headers: {
        'ACCEPT': 'application/json; odata.metadata=none'
      }
    }
    const _response: SPHttpClientResponse = await context.spHttpClient.get(_url, SPHttpClient.configurations.v1, _requestOptions);
    const _responseJson = await _response.json();
    const _events: ISpeakingEvent[] = _responseJson.value.map((item: any) => {
      return {
        id: item.Id,
        EventName: item.Title,
        Session: item.Session,
        SessionDate: new Date(item.SessionDate)
      };
    });
    console.log("getDataREST() returning data", _events);
    return _events;
  }

  const getDataPnP = async (): Promise<ISpeakingEvent[]> => {
    console.log("getDataPnp() called");
    const sp = spfi("https://pdslabs2.sharepoint.com").using(SPFx(props.context));
    const _eventsSP = await sp.web.lists.getByTitle("Speaking Events").items.select("Id, Title, Session, SessionDate").orderBy("SessionDate", false)();
    const _events: ISpeakingEvent[] = _eventsSP.map((item: any) => {
      return {
        id: item.Id,
        EventName: item.Title,
        Session: item.Session,
        SessionDate: new Date(item.SessionDate)
      };
    });
    console.log("getDataPnP() returning data", _events);
    return _events;
  }
    
  const getData = async (): Promise<ISpeakingEvent[]> => {
    console.log("getData() called");
    //return await getDataREST();
    return await getDataPnP();
  }

  const _getItemEntityType = async (): Promise<string> => {
    return props.context.spHttpClient.get(
      `https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')?$select=ListItemEntityTypeFullName`,
      SPHttpClient.configurations.v1)
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse.ListItemEntityTypeFullName;
      }) as Promise<string>;
  }

  const addEventREST = async (newEvent: ISpeakingEvent) => {
    console.log("addEventREST() called");
    const _url: string = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items";
    const _itemEntityType: string = await _getItemEntityType();
    const _result: SPHttpClientResponse = await props.context.spHttpClient.post(_url, SPHttpClient.configurations.v1,
      {
        body: JSON.stringify({
          Title: newEvent.EventName,
          Session: newEvent.Session,
          SessionDate: newEvent.SessionDate?.toISOString(),
          SessionType: "60 minute session",
          '@odata.type': _itemEntityType
        })
      });
    return _result;
  }

  const addEventPnP = async (newEvent: ISpeakingEvent) => {
    console.log("addEventPnP() called");
    const _result = spfi("https://pdslabs2.sharepoint.com").using(SPFx(props.context)).web.lists.getByTitle("Speaking Events").items.add(
      {
        Title: newEvent.EventName,
        Session: newEvent.Session,
        SessionDate: newEvent.SessionDate?.toISOString(),
        SessionType: "60 minute session"
      }
    );
    return _result;
  }

  useEffect(() => {
    console.log("useEffect([]) called");
    const timer = setTimeout(async () => {
      setEvents(await getData());
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("useEffect([counter]) called");
    setOddEven(counter % 2 === 0 ? 'even' : 'odd');
  }, [counter]);

  const onCounterButtonClicked = () => {
    console.log("onCounterButtonClicked() called");
    setCounter(counter + 1);
  }

  const onAddEventRESTClicked = async () => {
    console.log("onAddEventRESTClicked) called");
    const _currentDate = new Date();
    const _newEvent: ISpeakingEvent = {
      EventName: "New secret event",
      Session: "Super secret REST session",
      SessionDate: new Date(2023, 11, 1, _currentDate.getHours(), _currentDate.getMinutes(), _currentDate.getSeconds())
    }
    await addEventREST(_newEvent);
    setEvents(await getData());
  }

  const onAddEventPnPClicked = async () => {
    console.log("onAddEventPnPClicked) called");
    const _newEvent: ISpeakingEvent = {
      EventName: "New secret event",
      Session: "Super secret PnPJs session",
      SessionDate: new Date(2023, 11, 1, 9, 0)
    }
    await addEventPnP(_newEvent);
    setEvents(await getData());
  }


  console.log("Render() called");
  return (
    <section className={`${styles.speakingEvents} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.welcome}>
        {events.length == 0 ?
          <p>Loading Data . . .</p>
          :
          <>
            {/* <h3>Welcome to SharePoint Framework!</h3>
            <p>Counter: <strong>{counter}</strong></p>
            <p>Counter is <strong>{oddEven}</strong></p>
            <p><button onClick={() => onCounterButtonClicked()}>Click Me!!</button></p>
            <hr /> */}
            <div>
              <button onClick={() => onAddEventRESTClicked()}>Add REST Event!</button>
              <button onClick={() => onAddEventPnPClicked()}>Add PnPJs Event!</button>
            </div>
            <p style={{ textAlign: "left" }}>
              {events.map((event: ISpeakingEvent) => {
                return <div key={event.id}>{event.EventName}: <b>{event.Session}</b>: {event.SessionDate?.toLocaleDateString([], { hour: 'numeric', minute: '2-digit' })} </div>
              })}
            </p>
          </>
        }
      </div>
    </section>
  );
}

export default SpeakingEvents;
