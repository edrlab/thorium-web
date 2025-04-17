import React, { useCallback } from "react";

import { RSPrefs } from "@/preferences";

import Locale from "../resources/locales/en.json";

import { ActionComponentVariant, ActionKeys, IActionComponentContainer, IActionComponentTrigger } from "@/models/actions";

import TargetIcon from "./assets/icons/point_scan.svg";

import jumpToPositionStyles from "./assets/styles/jumpToPosition.module.css";

import { ActionIcon } from "./ActionTriggers/ActionIcon";
import { OverflowMenuItem } from "./ActionTriggers/OverflowMenuItem";
import { SheetWithType } from "./Sheets/SheetWithType";

import { Input, Label, NumberField } from "react-aria-components";

import { useEpubNavigator } from "@/hooks/useEpubNavigator";
import { useDocking } from "@/hooks/useDocking";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

import parseTemplate from "json-templates";

export const JumpToPositionActionContainer: React.FC<IActionComponentContainer> = ({ triggerRef }) => {
  const actionState = useAppSelector(state => state.actions.keys[ActionKeys.jumpToPosition]);
  const positionsList = useAppSelector(state => state.publication.positionsList);

  const reducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);
  const dispatch = useAppDispatch();

  const docking = useDocking(ActionKeys.jumpToPosition);
  const sheetType = docking.sheetType;

  const { currentLocator, go } = useEpubNavigator();

  const makeFieldLabel = useCallback(() => {
    const jsonTemplate = parseTemplate(Locale.reader.jumpToPosition.label);
    return jsonTemplate({ positionStart: 1, positionEnd: positionsList.length });
  }, [positionsList]);

  const setOpen = useCallback((value: boolean) => {
    dispatch(setActionOpen({ 
      key: ActionKeys.jumpToPosition,
      isOpen: value 
    }));
  }, [dispatch]);

  const handleAction = useCallback((value: number) => {
    if (!positionsList) return;
    
    const item = positionsList.find(item => item.locations.position === value);
    
    if (!item) return setOpen(false);

    go(item, !reducedMotion, () => setOpen(false));
  }, [positionsList, reducedMotion, go, setOpen]); 

  if (!positionsList) return null;

  return(
    <>
    <SheetWithType 
      sheetType={ sheetType }
      sheetProps={ {
        id: ActionKeys.jumpToPosition,
        triggerRef: triggerRef, 
        heading: Locale.reader.jumpToPosition.heading,
        className: jumpToPositionStyles.jumpToPosition,
        placement: "bottom",
        isOpen: actionState.isOpen || false,
        onOpenChangeCallback: setOpen,
        onClosePressCallback: () => setOpen(false),
        docker: docking.getDocker()
      } }
    >
      <NumberField
        className={ jumpToPositionStyles.jumpToPositionNumberField }
        defaultValue={ currentLocator()?.locations.position }
        minValue={ 1 }
        maxValue={ positionsList.length }
        step={ 1 }
        formatOptions={ { style: "decimal" } }
        onChange={ handleAction }
        isWheelDisabled={ true}
      >
        <Label className={ jumpToPositionStyles.jumpToPositionLabel }>{ makeFieldLabel() }</Label>
        <Input className={ jumpToPositionStyles.jumpToPositionInput } inputMode="numeric" />
      </NumberField>
    </SheetWithType>
    </>
  )
}

export const JumpToPositionAction: React.FC<IActionComponentTrigger> = ({ variant }) => {
  const actionState = useAppSelector(state => state.actions.keys[ActionKeys.jumpToPosition]);
  const positionsList = useAppSelector(state => state.publication.positionsList);
  const dispatch = useAppDispatch();
  
  const setOpen = (value: boolean) => {
    dispatch(setActionOpen({ 
      key: ActionKeys.jumpToPosition,
      isOpen: value 
    }));
  }

  if (!positionsList) return null;
    
  return(
    <>
    { (variant && variant === ActionComponentVariant.menu) 
      ? <OverflowMenuItem 
          label={ Locale.reader.jumpToPosition.trigger }
          SVG={ TargetIcon }
          shortcut={ RSPrefs.actions.keys[ActionKeys.jumpToPosition].shortcut }
          id={ ActionKeys.jumpToPosition }
          onActionCallback={ () => setOpen(!actionState.isOpen) }
        />
      : <ActionIcon
          visibility={ RSPrefs.actions.keys[ActionKeys.jumpToPosition].visibility } 
          ariaLabel={ Locale.reader.jumpToPosition.trigger }
          SVG={ TargetIcon } 
          placement="bottom" 
          tooltipLabel={ Locale.reader.jumpToPosition.tooltip }
          onPressCallback={ () => setOpen(!actionState.isOpen) }
        />
    }
    </>
  )
}