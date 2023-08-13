/* eslint-disable */
import * as React from 'react';
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

export default class SpeakingEvents extends React.Component<ISpeakingEventsProps, {}> {
  public render(): React.ReactElement<ISpeakingEventsProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.speakingEvents} ${hasTeamsContext ? styles.teams : ''}`}>
        <div>
          <h3>Welcome to SharePoint Framework!</h3>
          <ul className={styles.links}>
          </ul>
        </div>
      </section>
    );
  }
}
