/* eslint-disable */
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './SpeakingEvents.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';

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

  useEffect(() => {
    console.log("useEffect([]) called");
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
        <ul className={styles.links}>
        </ul>
      </div>
    </section>
  );
}

export default SpeakingEvents;
