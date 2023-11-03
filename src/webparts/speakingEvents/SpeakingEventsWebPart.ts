/* eslint-disable */
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'SpeakingEventsWebPartStrings';
import SpeakingEvents, { ISpeakingEventsProps } from './components/SpeakingEvents';
import { getEventService } from '../../services/getEventService';
import { IPropertyFieldList, IPropertyFieldSite, PropertyFieldListPicker, PropertyFieldListPickerOrderBy, PropertyFieldSpinButton, PropertyFieldSitePicker } from '@pnp/spfx-property-controls';
//import { PropertyFieldSitePicker } from '@pnp/spfx-property-controls/lib/PropertyFieldSitePicker';

export interface ISpeakingEventsWebPartProps {
  sites: IPropertyFieldSite[];
  list: IPropertyFieldList;
  eventsToDisplay: number;
  serviceSource: string;
}

export default class SpeakingEventsWebPart extends BaseClientSideWebPart<ISpeakingEventsWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<ISpeakingEventsProps> = React.createElement(
      SpeakingEvents,
      {
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        context: this.context,
        //dataService: getEventService(),
        properties: { sites: this.properties.sites, list: this.properties.list, eventsToDisplay:this.properties.eventsToDisplay, serviceSource: this.properties.serviceSource }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    this._environmentMessage = await this._getEnvironmentMessage();
    this.properties.serviceSource = this.properties.serviceSource || "REST";
    this.properties.eventsToDisplay = this.properties.eventsToDisplay || 15;
    if (!!this.properties.sites && !!this.properties.list) {
      getEventService({
        source: this.properties.serviceSource,
        context: this.context,
        siteUrl: this.properties.sites[0].url!,
        listName: this.properties.list.title!
      });
    }
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              throw new Error('Unknown host');
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    if (newValue !== oldValue) {
      if (propertyPath === 'list') {
        getEventService({ source: this.properties.serviceSource, context: this.context, siteUrl: this.properties.sites[0].url!, listName: newValue.title! });
      }
      if (propertyPath === 'serviceSource') {
        getEventService({ source: newValue, context: this.context, siteUrl: this.properties.sites[0].url!, listName: this.properties.list.title! });
      }
    }
    // else {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    // }
  }
  
  private onSiteChanged = async (propertyPath: string, oldValue: any, newValue: any): Promise<void> => {
    if (propertyPath === 'site' && newValue) {
      this.properties.sites = newValue;
      this.properties.list = null as any;
      this.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
      this.context.propertyPane.refresh();
    }
    else {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Displays upcoming Speaking events"
          },
          groups: [
            {
              groupName: "",
              groupFields: [
                PropertyFieldSitePicker('sites', {
                  label: 'Select sites',
                  initialSites: this.properties.sites,
                  context: this.context as any,
                  deferredValidationTime: 500,
                  multiSelect: false,
                  onPropertyChange: this.onSiteChanged.bind(this),
                  properties: this.properties,
                  key: 'sitesFieldId'
                }),
                PropertyFieldListPicker('list', {
                  label: 'Select a list with Speaking events',
                  selectedList: this.properties.list,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: this.properties.sites === undefined ,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  onGetErrorMessage: null as any,
                  deferredValidationTime: 0,
                  includeListTitleAndUrl: true,
                  webAbsoluteUrl: this.properties.sites ? this.properties.sites[0]?.url : "",
                  key: 'listPickerFieldId'
                }),
                PropertyFieldSpinButton('eventsToDisplay', {
                  label: 'Number of events to display',
                  initialValue: this.properties.eventsToDisplay,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  suffix: ' events',
                  min: 0,
                  max: 20,
                  step: 1,
                  decimalPlaces: 0,
                  incrementIconName: 'CalculatorAddition',
                  decrementIconName: 'CalculatorSubtract',
                  key: 'spinButtonFieldId'
                })
              ]
            }
          ]
        },
        {
          header: {
            description: "Advanced Settings"
          },
          groups: [
            {
              groupName: "",
              groupFields: [
                PropertyPaneDropdown('serviceSource',
                  {
                    label: "Service Source",
                    selectedKey: this.properties.serviceSource,
                    options: [
                      {
                        key: "PnPJs",
                        text: "PnPJs"
                      },
                      {
                        key: "REST",
                        text: "REST"
                      }
                    ]
                  })
              ]
            }
          ]
        }
      ]
    };
  }
}
