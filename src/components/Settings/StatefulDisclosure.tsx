"use client";

import settingsStyles from "./assets/styles/thorium-web.reader.settings.module.css";

import { ThDisclosure, ThDisclosureProps } from "@/core/Components/Settings/ThDisclosure";

import classNames from "classnames";

export interface StatefulDisclosureProps extends Omit<ThDisclosureProps, "classNames"> {
  standalone?: boolean;
}

export const StatefulDisclosure = ({
  standalone,
  className,
  compounds,
  ...props
}: StatefulDisclosureProps) => {
  return (
    <>
    <ThDisclosure
      { ...props }
      className={ classNames(
        settingsStyles.disclosure,
        standalone && settingsStyles.group,
        className
      ) }
      compounds={{
        heading: {
          className: settingsStyles.disclosureHeading,
          ...(compounds?.heading || {})
        },
        button: {
          className: settingsStyles.disclosureButton,
          ...(compounds?.button || {})
        },
        panel: {
          className: settingsStyles.disclosurePanel,
          ...(compounds?.panel || {})
        }
      }}
    />
    </>
  )
}
