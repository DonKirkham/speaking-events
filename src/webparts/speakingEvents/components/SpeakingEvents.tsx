/* eslint-disable */
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './SpeakingEvents.module.scss';
import { escape, get, set } from '@microsoft/sp-lodash-subset';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISpeakingEvents as ISpeakingEvent } from '../../../models/SpeakingEvents';
import { HttpClient, HttpClientResponse, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IEventRecord } from 'office-ui-fabric-react';
import * as _ from 'lodash';

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

  // const [counter, setCounter] = useState<number>(0);
  // const [oddEven, setOddEven] = useState<string>('');
  const [view, setView] = useState<string>('');
  const [events, setEvents] = useState<ISpeakingEvent[]>([]);
  const [myGraphData, setMyGraphData] = useState<any>();
  const [catData, setCatData] = useState<any>([]);

  // useEffect(() => {
  //   console.log("useEffect([counter]) called");
  //   setOddEven(counter % 2 === 0 ? 'even' : 'odd');
  // }, [counter]);

  // const onCounterButtonClicked = () => {
  //   console.log("onCounterButtonClicked() called");
  //   setCounter(counter + 1);
  // }

  useEffect(() => {
    console.log("useEffect([view]) called");
    setEvents([]);
    setMyGraphData({});
    setCatData([]);
  }, [view]);

  // HERE'S THE DATA STUFF
  const getEventsREST = async (): Promise<ISpeakingEvent[]> => {
    console.log("getEventsREST() called");
    const _url = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items?$select=Id,Title,Session,SessionDate&$filter=SessionDate gt DateTime'2024-04-01T00:00:00'&$orderby=SessionDate%20asc";
    const _requestOptions = {
      headers: {
        'ACCEPT': 'application/json; odata.metadata=none'
      }
    }
    const _response: SPHttpClientResponse = await context.spHttpClient.get(_url, SPHttpClient.configurations.v1, _requestOptions);
    const _responseJson = await _response.json();
    const _events: ISpeakingEvent[] = await _responseJson.value.map((item: any) => {
      return {
        Id: item.Id,
        EventName: item.Title,
        Session: item.Session,
        SessionDate: new Date(item.SessionDate)
      };
    });
    console.log("getEventsREST() returning data", _events);
    await setEvents(_events);
    return _events;
  }

  const getEventsPnP = async (): Promise<ISpeakingEvent[]> => {
    console.log("getEventsPnP() called");
    const sp = spfi("https://pdslabs2.sharepoint.com").using(SPFx(props.context));
    const _eventsSP: ISpeakingEvent[] = await sp.web.lists.getByTitle("Speaking Events").items.select("Id, Title, Session, SessionDate").filter("SessionDate gt DateTime'2024-04-01T00:00:00'").orderBy("SessionDate", true)();
    const _events: ISpeakingEvent[] = await _eventsSP.map((item: any) => {
      return {
        Id: item.Id,
        EventName: item.Title,
        Session: item.Session,
        SessionDate: new Date(item.SessionDate)
      };
    });
    console.log("getEventsPnP() returning data", _events);
    await setEvents(_events);
    return _events;
  }

  const _getItemEntityType = async (): Promise<string> => {
    return await props.context.spHttpClient.get(
      `https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')?$select=ListItemEntityTypeFullName`,
      SPHttpClient.configurations.v1)
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse.ListItemEntityTypeFullName;
      }) as Promise<string>;
  }

  const addEventREST = async (): Promise<void> => {
    console.log("addEventREST() called");
    const _url: string = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items";
    const _itemEntityType: string = await _getItemEntityType();
    await props.context.spHttpClient.post(_url, SPHttpClient.configurations.v1,
      {
        body: JSON.stringify({
          Title: "Secret event",
          Session: "Super secret REST session",
          SessionDate: new Date(2024, 3, 1, 9, 0),
          SessionType: "60 minute session",
          '@odata.type': _itemEntityType
        })
      });
    await getEventsREST();
  }

  const addEventPnP = async (): Promise<void> => {
    console.log("addEventPnP() called");
    await spfi("https://pdslabs2.sharepoint.com").using(SPFx(props.context)).web.lists.getByTitle("Speaking Events").items.add(
      {
        Title: "Secret event",
        Session: "NEW Super secret PnpJs session",
        SessionDate: new Date(2024, 3, 1, 9, 0),
        SessionType: "60 minute session"
      }
    );
    await getEventsPnP();
  }

  const updateEventREST = async (): Promise<void> => {
    console.log("updateEventREST() called");
    const _url1 = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items?$select=Id&$filter=Title eq 'Secret event'&$top=1";
    const _requestOptions1 = {
      headers: {
        'ACCEPT': 'application/json; odata.metadata=none'
      }
    }
    const _response: SPHttpClientResponse = await context.spHttpClient.get(_url1, SPHttpClient.configurations.v1, _requestOptions1);
    const _responseJson = await _response.json();
    const _eventToUpdate = _responseJson.value[0];

    _eventToUpdate.Session = "UPDATED super secret REST session";

    const request: any = {
      headers: {
        'ACCEPT': 'application/json',
        'Content-type': 'application/json',
        'Content-length': JSON.stringify(_eventToUpdate).length.toString(),
        'X-HTTP-Method': 'MERGE',
        'IF-MATCH': '*'
      },
      body: 
        JSON.stringify(_eventToUpdate)      
    };
    const _url = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items(" + _eventToUpdate.Id + ")";
    await props.context.spHttpClient.post(_url, SPHttpClient.configurations.v1, request);
    getEventsREST();
  }

  const updateEventPnP = async (): Promise<void> => {
    console.log("updateEventPnP() called");
    const _itemToUpdate = await spfi("https://pdslabs2.sharepoint.com").using(SPFx(props.context)).web.lists.getByTitle("Speaking Events").items.filter("Title eq 'Secret event'").top(1)();

    const _result = await spfi("https://pdslabs2.sharepoint.com").using(SPFx(props.context)).web.lists.getByTitle("Speaking Events").items.getById(_itemToUpdate[0].Id).update(
      {
        Session: "UPDATED super secret PnP session"
      }
    );
    await getEventsPnP();
  }

  const deleteEventREST = async (): Promise<void> => {
    console.log("deleteEventREST() called");
    const _url1 = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items?$select=Id&$filter=Title eq 'Secret event'&$top=1";
    const _requestOptions1 = {
      headers: {
        'ACCEPT': 'application/json; odata.metadata=none'
      }
    }
    const _response: SPHttpClientResponse = await context.spHttpClient.get(_url1, SPHttpClient.configurations.v1, _requestOptions1);
    const _responseJson = await _response.json();
    const _eventToDelete= await _responseJson.value[0];

    const _url = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items("+  + _eventToDelete.Id +")";
    const _requestOptions = {
      headers: {
        'ACCEPT': 'application/json; odata.metadata=none',
        'Content-type': 'application/json;odata=verbose',
        'IF-MATCH': '*',
        'X-HTTP-Method': 'DELETE'
      }
    }
    await props.context.spHttpClient.post(_url, SPHttpClient.configurations.v1, _requestOptions);
    await getEventsREST();
  }

  const deleteEventPnP = async (): Promise<void> => {
    console.log("deleteEventPnP() called");
    const _itemToDelete = await spfi("https://pdslabs2.sharepoint.com").using(SPFx(props.context)).web.lists.getByTitle("Speaking Events").items.filter("Title eq 'Secret event'").top(1)();

    const _result = await spfi("https://pdslabs2.sharepoint.com").using(SPFx(props.context)).web.lists.getByTitle("Speaking Events").items.getById(_itemToDelete[0].Id).delete();
    await getEventsPnP();
  }

  const getMyGraphData = async (): Promise<void> => {
    console.log("getMyGraphData() called");
    context.msGraphClientFactory
      .getClient('3')
      .then((client: MSGraphClientV3): void => {
        client
          .api("/me")
          .get((err, res) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log("getMyGraphData() returning data", res);
            setMyGraphData(res);
          });
      });
  }

  const getCatData = async (): Promise<void> => {
    console.log("getCatData() called");
    const _url = "https://cat-fact.herokuapp.com/facts";
    const _requestOptions = {
      headers: {
        'ACCEPT': 'application/json'
      }
    }

    const _catData = await context.httpClient.get(
      _url, HttpClient.configurations.v1, _requestOptions)
      .then((response: HttpClientResponse) => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse;
      }) as Promise<any>;
    const _random = Math.floor(Math.random() * (4 - 0 + 1) + 0);
    console.log("getCatData()._random", _random);
    console.log("getCatData() returning data", _catData);
    console.log("getCatData()._catData[_random] returning data", _catData[_random].text);
    await setCatData(_catData[_random].text);
  }

  console.log("Render() called");
  return (
    <section className={`${styles.speakingEvents} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.welcome}>
        <p>
          <button onClick={() => setView("REST")}>REST</button>
          <button onClick={() => setView("PnpJs")}>PnPJs</button>
          <button onClick={() => setView("MsGraph")}>MS Graph</button>
          <button onClick={() => setView("OpenAPI")}>Anonymous API</button>
        </p>
        {view == "REST" &&
          <div>
            <div>REST API</div>
            <button onClick={async () => await getEventsREST()}>Get Events</button>
            <button onClick={async () => await addEventREST()}>Add event</button>
            <button onClick={async () => await updateEventREST()}>Update Event</button>
            <button onClick={async () => await deleteEventREST()}>Delete Event</button>
          </div>
        }
        {view == "PnpJs" &&
          <div>
            <div>PnPJs API</div>
            <button onClick={async () => await getEventsPnP()}>Get Events</button>
            <button onClick={async () => await addEventPnP()}>Add event</button>
            <button onClick={async () => await updateEventPnP()}>Update Event</button>
            <button onClick={async () => await deleteEventPnP()}>Delete Event</button>
          </div>
        }
        {view == "MsGraph" &&
          <div>
            <div>MS Graph API</div>
            <button onClick={async () => await getMyGraphData()}>Get My data</button>
          </div>
        }
        {view == "OpenAPI" &&
          <div>
            <div>Open API</div>
            <button onClick={async () => await getCatData()}>Get Cat Fact</button>
          </div>
        }

        {(view == "REST" || view == "PnpJs") &&
          <> 
            <>
              {/* <h3>Welcome to SharePoint Framework!</h3>
            <p>Counter: <strong>{counter}</strong></p>
            <p>Counter is <strong>{oddEven}</strong></p>
            <p><button onClick={() => onCounterButtonClicked()}>Click Me!!</button></p>
            <hr /> */}
              {/* <div>
              <button onClick={() => onAddEventRESTClicked()}>Add REST Event!</button>
              <button onClick={() => onAddEventPnPClicked()}>Add PnPJs Event!</button>
            </div> */}
              <p style={{ textAlign: "left" }}>
                {events.map((event: ISpeakingEvent) => {
                  return <div key={event.Id}>{event.EventName}: <b>{event.Session}</b>: {event.SessionDate?.toLocaleDateString([], { hour: 'numeric', minute: '2-digit' })} </div>
                })}
              </p>
            </>
          </>
        }
        {view == "MsGraph" &&
          <>
            <div style={{ textAlign: "left" }}><pre>{JSON.stringify(myGraphData, null, 2)}</pre></div>
          </>
        }
        {view == "OpenAPI" && catData &&
          <>
            <blockquote >{catData}</blockquote>
          </>
        }

      </div>
    </section>
  );
}

export default SpeakingEvents;
