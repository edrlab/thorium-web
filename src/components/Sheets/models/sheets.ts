import { ReactNode, RefObject } from "react";
import { ThDockingKeys, ThSheetHeaderVariant } from "@/preferences/models";
import { ActionsStateKeys } from "@/lib/actionsReducer";

export interface StatefulSheet {
  id: ActionsStateKeys;
  triggerRef: RefObject<HTMLElement | null>;
  heading: string;
  headerVariant?: ThSheetHeaderVariant;
  className?: string;
  underlayClassName?: string;
  headerClassName?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClosePress: () => void;
  docker?: ThDockingKeys[];
  headerActions?: ReactNode;
  children?: ReactNode;
  resetFocus?: unknown;
  focusWithinRef?: RefObject<HTMLElement | null>;
  focusSelector?: string;
  scrollTopOnFocus?: boolean;
  dismissEscapeKeyClose?: boolean;
}