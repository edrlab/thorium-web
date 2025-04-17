import { IProgression } from "../progression";
import { TocItem } from "../toc";
import { Locator } from "@readium/shared";

export interface IPublicationState {
  runningHead?: string;
  isFXL: boolean;
  isRTL: boolean;
  progression: IProgression;
  positionsList: Locator[];
  atPublicationStart: boolean;
  atPublicationEnd: boolean;
  tocTree?: TocItem[];
  tocEntry?: string;
}