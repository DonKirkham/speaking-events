/* eslint-disable */
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './SpeakingEvents.module.scss';
import { escape, set } from '@microsoft/sp-lodash-subset';
import { ISpeakingEvents } from '../../../models/SpeakingEvents';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { spfi, SPFx } from "@pnp/sp";
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
    userDisplayName
  } = props;

  const [counter, setCounter] = useState<number>(0);
  const [oddEven, setOddEven] = useState<string>('');
  const [events, setEvents] = useState<ISpeakingEvents[]>([]);

  const getRestData = async () => {
    console.log("getData() called");
    const _url = "https://pdslabs2.sharepoint.com/_api/web/lists/getbytitle('Speaking%20Events')/items?$select=Title,Session,SessionDate";
    const _spHttpClient = props.context.spHttpClient;
    const _eventsSP: SPHttpClientResponse = await _spHttpClient.get(_url, SPHttpClient.configurations.v1);
    const _eventsJson = await _eventsSP.json();
    const _events = _eventsJson.value.map((event: any) => {
      return {
        EventName: event.Title,
        Session: event.Session,
        SessionDate: new Date(event.SessionDate)
      } as ISpeakingEvents;
    });
    setEvents(_events);
  }

  const getPnpData = async () => {
    console.log("getPnpData() called");
    const _url = "https://pdslabs2.sharepoint.com";
    const sp = spfi(_url).using(SPFx(props.context));
    const _eventsSP = await sp.web.lists.getByTitle("Speaking Events").items.select("Title,Session,SessionDate")();
    const _events = _eventsSP.map((event: any) => {
      return {
        EventName: event.Title,
        Session: event.Session,
        SessionDate: new Date(event.SessionDate)
      } as ISpeakingEvents;
    });
    setEvents(_events);
  }

  useEffect(() => {
    console.log("useEffect([]) called");
    const timer = setTimeout(async() => {
      await getRestData();
      await getPnpData();
    }, 0);
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

  console.log("Render() called");
  return (
    <section className={`${styles.speakingEvents} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.welcome}>
        <h3>Welcome to SharePoint Framework!</h3>
        <p>Counter: <strong>{counter}</strong></p>
        <p>Counter is <strong>{oddEven}</strong></p>
        <p><button onClick={() => onCounterButtonClicked()}>Click Me!!</button></p>
        {events.length == 0 ?
          <p>Loading Data . . .</p>
          :
          <ul className={styles.links}>
            {events.map((event, index) => {
              return <li key={index}>{event.EventName} - {event.Session} - {event.SessionDate?.toLocaleDateString()}</li>;
            })}
          </ul>
        }
      </div>
    </section>
  );
}

export default SpeakingEvents;
