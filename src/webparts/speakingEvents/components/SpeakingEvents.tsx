/* eslint-disable */
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './SpeakingEvents.module.scss';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISpeakingEvent as ISpeakingEvent } from '../../../models/ISpeakingEvent';
import { getEventService } from '../../../services/getEventService';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { ISpeakingEventsWebPartProps } from '../SpeakingEventsWebPart';

export interface ISpeakingEventsProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  properties: ISpeakingEventsWebPartProps
}

export const SpeakingEvents: React.FC<ISpeakingEventsProps> = (props) => {
  const {
    hasTeamsContext
  } = props;

  const [events, setEvents] = useState<ISpeakingEvent[]>([]);
  const [wpProperties, setWpProperties] = useState<ISpeakingEventsWebPartProps>();

  useEffect(() => {
    console.log("useEffect() called");
    if (wpProperties !== props.properties) {
      setWpProperties(props.properties);
    }
  });

  useEffect(() => {
    (async () => {
      console.log("useEffect([wpProperties]) called");
      await getEvents();
    })();
  }, [wpProperties]);

  const getEvents = async (): Promise<void> => {
    console.log("getEvents() called");
    const eventService = getEventService();
    if (eventService === undefined) {
      return;
    }
    setTimeout(async () => {
      setEvents(await eventService.GetEvents(props.properties.eventsToDisplay));
    }, 0);
  }

  const onAddEvent = async (): Promise<void> => {
    console.log("onAddEvent called");
    const _currentDate = new Date();
    const _newEvent: ISpeakingEvent = {
      EventName: "New secret event",
      Session: "Super secret session",
      SessionDate: new Date(2023, 11, 1, _currentDate.getHours(), _currentDate.getMinutes(), _currentDate.getSeconds())
    }
    await getEventService().AddEvent(_newEvent);
    await getEvents();
  }

  const onDeleteEvent = async (id): Promise<void> => {
    console.log("onDeleteEvent called");
    await getEventService().DeleteEvent(id);
    await getEvents();
  };

  const onUpdateEvent = async (event: ISpeakingEvent): Promise<void> => {
    console.log("onUpdateEvent called");
    const _updateEvent: ISpeakingEvent = {
      id: event.id,
      EventName: `UPDATED ${event.EventName}` ,
      Session: `UPDATED ${event.Session}`
    }
    await getEventService().UpdateEvent(_updateEvent);
    await getEvents();
  };

  console.log("Render() called");
  return (
    <section className={`${styles.speakingEvents} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.welcome}>
        {!getEventService() ?
          <p>Event Service not initialized</p>
          : events.length === 0 ?
            <p>Loading Data . . .</p>
            :
            <>
              <h3 className={styles.welcome}>Speaking Events({wpProperties?.serviceSource})</h3>
              <div>
                <button onClick={() => onAddEvent()}>Add Event!</button>
              </div>
              <p style={{ textAlign: "left" }}>
                {events.map((event: ISpeakingEvent, index: number) => {
                  if (index < props.properties.eventsToDisplay) {
                    return (
                      <div key={event.id}>{event.EventName}: <b>{event.Session}</b>: {event.SessionDate?.toLocaleDateString([], { hour: 'numeric', minute: '2-digit' })}
                        {(event.EventName?.indexOf("New") === 0 || event.EventName?.indexOf("UPDATED") === 0) &&
                          <>
                            <a href='#' onClick={() => onDeleteEvent(event.id)}>
                              <FontIcon aria-label="Delete" iconName="Delete" className={styles.iconClass} />
                            </a>
                            <a href='#' onClick={() => onUpdateEvent(event)}>
                              <FontIcon aria-label="Update" iconName="Edit" className={styles.iconClass} />
                            </a>
                          </>
                        }
                      </div>
                    );
                  }
                }
                )}
              </p>
            </>
        }
      </div>
    </section>
  );
}

export default SpeakingEvents;
