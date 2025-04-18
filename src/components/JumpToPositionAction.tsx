import React, { FormEvent, useCallback, useEffect, useState } from "react";

import { RSPrefs } from "@/preferences";

import Locale from "../resources/locales/en.json";

import { ActionComponentVariant, ActionKeys, IActionComponentContainer, IActionComponentTrigger } from "@/models/actions";

import TargetIcon from "./assets/icons/point_scan.svg";

import jumpToPositionStyles from "./assets/styles/jumpToPosition.module.css";

import { ActionIcon } from "./ActionTriggers/ActionIcon";
import { OverflowMenuItem } from "./ActionTriggers/OverflowMenuItem";
import { SheetWithType } from "./Sheets/SheetWithType";

import { Button, Form, Input, Label, NumberField } from "react-aria-components";

import { useEpubNavigator } from "@/hooks/useEpubNavigator";
import { useDocking } from "@/hooks/useDocking";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

import parseTemplate from "json-templates";

export const JumpToPositionActionContainer: React.FC<IActionComponentContainer> = ({ triggerRef }) => {
  const actionState = useAppSelector(state => state.actions.keys[ActionKeys.jumpToPosition]);
  const positionsList = useAppSelector(state => state.publication.positionsList);

  // TODO: Update. We don’t have a timeline yet, so we use the progression we already have
  const positionNumbers = useAppSelector(state => state.publication.progression.currentPositions);

  const reducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);
  const dispatch = useAppDispatch();

  const docking = useDocking(ActionKeys.jumpToPosition);
  const sheetType = docking.sheetType;

  const { go } = useEpubNavigator();

  // Component has to handle updates locally since EpubNavigator updates positions, 
  // so we use these as an intermediary
  const [position, setPosition] = useState(0);

  // Label indicates the total number of positions for the book
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

  // NumberField onChange won’t fire if the value has been typed
  // so we need to handle the input manually
  const handleInput = useCallback((e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setPosition(parseInt(target.value));
  }, []);

  // This is a form submit handler so we have to preventDefault
  // We have to use this otherwise any change will trigger a navigation
  const handleAction = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!positionsList) return;
    
    const item = positionsList.find(item => item.locations.position === position);
    
    if (!item || (!!position && positionNumbers?.includes(position))) return setOpen(false);

    go(item, !reducedMotion, () => setOpen(false));
  }, [position, positionsList, positionNumbers, reducedMotion, go, setOpen]); 

  // Since we are using an intermediary local state, we must keep track when positionNumbers changes
  useEffect(() => {
    positionNumbers && setPosition(positionNumbers[0]);
  }, [positionNumbers]);

  // In case there is no positions list we return
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
      <Form 
        className={ jumpToPositionStyles.jumpToPositionForm }
        onSubmit={ handleAction }
      >
        <NumberField
          name="jumpToPosition"
          className={ jumpToPositionStyles.jumpToPositionNumberField }
          onChange={ setPosition }
          onInput={ handleInput }
          value={ position }
          minValue={ 1 }
          maxValue={ positionsList.length }
          step={ 1 }
          formatOptions={ { style: "decimal" } }
          isWheelDisabled={ true }
        >
          <Label 
            className={ jumpToPositionStyles.jumpToPositionLabel }
          >
            { makeFieldLabel() }
          </Label>
          <Input 
            className={ jumpToPositionStyles.jumpToPositionInput } 
            inputMode="numeric" 
          />
        </NumberField>
        <Button 
          className={ jumpToPositionStyles.jumpToPositionButton } 
          type="submit" 
          isDisabled={ !position || (!!position && positionNumbers?.includes(position)) }
        >
          { Locale.reader.jumpToPosition.go }
        </Button>
      </Form>
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

  // In case there is no positions list we return
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