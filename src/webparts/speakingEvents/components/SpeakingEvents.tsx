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
import { DisplayMode } from '@microsoft/sp-core-library';
import { Placeholder, WebPartTitle } from '@pnp/spfx-controls-react';
import { Icon } from 'office-ui-fabric-react';

//globals

export interface ISpeakingEventsProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  displayMode: DisplayMode;
  properties: ISpeakingEventsWebPartProps;
  updateWebpartTitle: (title: string) => void;
}

export const SpeakingEvents: React.FC<ISpeakingEventsProps> = (props) => {
  const {
    //description,
    //isDarkTheme,
    //environmentMessage,
    hasTeamsContext,
    //userDisplayName,
    //context
  } = props;

  // const [counter, setCounter] = useState<number>(0);
  // const [oddEven, setOddEven] = useState<string>('');
  const [events, setEvents] = useState<ISpeakingEvent[]>([]);
  const [wpProperties, setWpProperties] = useState<ISpeakingEventsWebPartProps>();


  const getData = async (): Promise<ISpeakingEvent[]> => {
    console.log("getData() called");
    const dataService = getEventService();
    if (dataService === undefined) {
      return [];
    }
    let _events: ISpeakingEvent[] = [];
    const timer = setTimeout(async () => {
      _events = await dataService.GetUpcomingEvents(props.properties.eventsToDisplay);
      setEvents(_events);
      return _events;
    }, 0);
    () => clearTimeout(timer)
    return _events;
  }

  useEffect(() => {
    console.log("useEffect() called");
    if (wpProperties !== props.properties) {
      setWpProperties(props.properties);
    }
  });

  // useEffect(() => {
  //   console.log("useEffect([]) called");
  // }, []);

  useEffect(() => {
    (async () => {
      console.log("useEffect([wpProperties]) called");
      await getData();
    })();
  }, [wpProperties]);


  // useEffect(() => {
  //   console.log("useEffect([counter]) called");
  //   setOddEven(counter % 2 === 0 ? 'even' : 'odd');
  // }, [counter]);

  // const onCounterButtonClicked = () => {
  //   console.log("onCounterButtonClicked() called");
  //   setCounter(counter + 1);
  // }

  const onAddEventRESTClicked = async (): Promise<void> => {
    console.log("onAddEventRESTClicked) called");
    const _currentDate = new Date();
    const _newEvent: ISpeakingEvent = {
      EventName: "New secret event",
      Session: "Super secret session",
      SessionDate: new Date()
      //new Date(2023, 11, 1, _currentDate.getHours(), _currentDate.getMinutes(), _currentDate.getSeconds())
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
      <div className={styles.row}>
        <div className={styles.column}>
          <div className={styles.webRow} >
            <WebPartTitle className={styles.webPartTitle} displayMode={props.displayMode}
              title={props.properties.title}
              updateProperty={props.updateWebpartTitle} />
          </div>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.column}>
        </div>
      </div>
    </section>
  );
}

export default SpeakingEvents;
