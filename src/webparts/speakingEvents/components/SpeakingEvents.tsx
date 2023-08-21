/* eslint-disable */
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './SpeakingEvents.module.scss';
//import { escape, set  } from '@microsoft/sp-lodash-subset';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISpeakingEvent as ISpeakingEvent } from '../../../models/ISpeakingEvent';
//import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
//import { EventServiceREST } from '../../../services/EventsServiceREST';
//import { EventServicePnP } from '../../../services/EventsServicePnP';
import { getEventService } from '../../../services/getEventService';
import { IEventService } from '../../../services/IEventService';
import { get, set } from '@microsoft/sp-lodash-subset';
import { ISpeakingEventsWebPartProps } from '../SpeakingEventsWebPart';

//globals

export interface ISpeakingEventsProps {
  //description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  dataService: IEventService;
  properties: ISpeakingEventsWebPartProps
  //maxEvents: number;
}

export const SpeakingEvents: React.FC<ISpeakingEventsProps> = (props) => {
  const {
    //description,
    isDarkTheme,
    environmentMessage,
    hasTeamsContext,
    userDisplayName,
    context
  } = props;

  const [counter, setCounter] = useState<number>(0);
  const [oddEven, setOddEven] = useState<string>('');
  const [events, setEvents] = useState<ISpeakingEvent[]>([]);
  const [properties, setProperties] = useState<ISpeakingEventsWebPartProps>(null);


  const getData = async (): Promise<ISpeakingEvent[]> => {
    console.log("getData() called");
    const dataService = getEventService();
    if (dataService === undefined) {
      return [];
    }
    let _events: ISpeakingEvent[] = [];
    const timer = setTimeout(async () => {
      _events = await dataService.GetEvents(props.properties.eventsToDisplay);
      setEvents(_events);
      return _events;
    }, 0);
    () => clearTimeout(timer)
    return _events;
  }

  useEffect(() => {
    console.log("useEffect() called");
    if (properties !== props.properties) {
      setProperties(props.properties);
    }
  });

  // useEffect(() => {
  //   console.log("useEffect([]) called");
  // }, []);

  useEffect(() => {
    (async () => {
      console.log("useEffect([properties]) called");
      await getData();
    })();
  }, [properties]);


  useEffect(() => {
    console.log("useEffect([counter]) called");
    setOddEven(counter % 2 === 0 ? 'even' : 'odd');
  }, [counter]);

  const onCounterButtonClicked = () => {
    console.log("onCounterButtonClicked() called");
    setCounter(counter + 1);
  }

  const onAddEventRESTClicked = async (): Promise<void> => {
    console.log("onAddEventRESTClicked) called");
    const _currentDate = new Date();
    const _newEvent: ISpeakingEvent = {
      EventName: "New secret event",
      Session: "Super secret session",
      SessionDate: new Date(2023, 11, 1, _currentDate.getHours(), _currentDate.getMinutes(), _currentDate.getSeconds())
    }
    await getEventService().AddEvent(_newEvent);
    setEvents(await getData());
  }

  const onAddEventPnPClicked = async (): Promise<void> => {
    console.log("onAddEventPnPClicked) called");
    const _currentDate = new Date();
    const _newEvent: ISpeakingEvent = {
      EventName: "New secret event",
      Session: "Super secret session",
      SessionDate: new Date(2023, 11, 1, _currentDate.getHours(), _currentDate.getMinutes(), _currentDate.getSeconds())
    }
    await getEventService().AddEvent(_newEvent);
    setEvents(await getData());
  }


  console.log("Render() called");
  return (
    <section className={`${styles.speakingEvents} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.welcome}>
        {!getEventService() ?
          <p>Service not initialized</p>
          : events.length === 0 ?
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
