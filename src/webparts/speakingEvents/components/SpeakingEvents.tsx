/* eslint-disable */
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './SpeakingEvents.module.scss';
import { escape, set } from '@microsoft/sp-lodash-subset';
import { getDateRangeArray } from 'office-ui-fabric-react';

//globals

export interface ISpeakingEventsProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
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
  //const [events, setEvents] = useState<SpeakingEvents[]>([]);

  const getData = () => {
    console.log("getData() called");
    setCounter(counter + 100);
  }

  useEffect(() => {
    console.log("useEffect([]) called");
    const timer = setTimeout(() => {
      getData();
    }, 2000);
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
        {counter == 0 ?
          <p>Loading Data . . .</p>
          :
          <>
            <p>Counter: <strong>{counter}</strong></p>
            <p>Counter is <strong>{oddEven}</strong></p>
            <p><button onClick={() => onCounterButtonClicked()}>Click Me!!</button></p>
          </>
        }
        <ul className={styles.links}>
        </ul>
      </div>
    </section>
  );
}

export default SpeakingEvents;
