import { PreferencesReducerState } from "../preferencesReducer";
import { ThPreferences, CustomizableKeys } from "@/preferences/preferences";
import { ThProgressionFormat, ThRunningHeadFormat, ThBreakpoints, ThPaginatedAffordancePrefValue } from "@/preferences/models";

const mapRenditionFormat = <T>(
  format: { default?: { variants: T }, breakpoints?: { [key in ThBreakpoints]?: { variants: T } } } | undefined
) => {
  const result: {
    default?: T;
    breakpoints?: { [key in ThBreakpoints]?: T };
  } = {};

  if (format?.default?.variants !== undefined) {
    result.default = format.default.variants;
  }

  if (format?.breakpoints) {
    result.breakpoints = Object.entries(format.breakpoints).reduce((acc, [bp, value]) => {
      if (value?.variants !== undefined) {
        acc[bp as ThBreakpoints] = value.variants;
      }
      return acc;
    }, {} as { [key in ThBreakpoints]?: T });
  }

  return result;
};

const mapPaginatedAffordance = (
  format: { default?: ThPaginatedAffordancePrefValue, breakpoints?: { [key in ThBreakpoints]?: ThPaginatedAffordancePrefValue } } | undefined
) => {
  const result: {
    default?: ThPaginatedAffordancePrefValue;
    breakpoints?: { [key in ThBreakpoints]?: ThPaginatedAffordancePrefValue };
  } = {};

  if (format?.default) {
    result.default = format.default;
  }

  if (format?.breakpoints) {
    result.breakpoints = Object.entries(format.breakpoints).reduce((acc, [bp, value]) => {
      if (value) {
        acc[bp as ThBreakpoints] = value;
      }
      return acc;
    }, {} as { [key in ThBreakpoints]?: ThPaginatedAffordancePrefValue });
  }

  return result;
};

export const mapPreferencesToState = <T extends CustomizableKeys>(prefs: ThPreferences<T>): PreferencesReducerState => {
  return {
    progressionFormat: {
      reflow: mapRenditionFormat<ThProgressionFormat | ThProgressionFormat[]>(
        prefs.theming?.progression?.format?.reflow
      ),
      fxl: mapRenditionFormat<ThProgressionFormat | ThProgressionFormat[]>(
        prefs.theming?.progression?.format?.fxl
      ),
      webPub: mapRenditionFormat<ThProgressionFormat | ThProgressionFormat[]>(
        prefs.theming?.progression?.format?.webPub
      ),
      divina: mapRenditionFormat<ThProgressionFormat | ThProgressionFormat[]>(
        prefs.theming?.progression?.format?.divina
      )
    },
    runningHeadFormat: {
      reflow: mapRenditionFormat<ThRunningHeadFormat>(
        prefs.theming?.header?.runningHead?.format?.reflow
      ),
      fxl: mapRenditionFormat<ThRunningHeadFormat>(
        prefs.theming?.header?.runningHead?.format?.fxl
      ),
      webPub: mapRenditionFormat<ThRunningHeadFormat>(
        prefs.theming?.header?.runningHead?.format?.webPub
      ),
      divina: mapRenditionFormat<ThRunningHeadFormat>(
        prefs.theming?.header?.runningHead?.format?.divina
      )
    },
    ui: prefs.theming?.layout?.ui,
    scrollAffordances: {
      hintInImmersive: prefs.affordances?.scroll?.hintInImmersive ?? false,
      toggleOnMiddlePointer: prefs.affordances?.scroll?.toggleOnMiddlePointer ?? [],
      hideOnForwardScroll: prefs.affordances?.scroll?.hideOnForwardScroll ?? false,
      showOnBackwardScroll: prefs.affordances?.scroll?.showOnBackwardScroll ?? false
    },
    paginatedAffordances: {
      reflow: mapPaginatedAffordance(prefs.affordances?.paginated?.reflow),
      fxl: mapPaginatedAffordance(prefs.affordances?.paginated?.fxl),
      divina: mapPaginatedAffordance(prefs.affordances?.paginated?.divina)
    },
    readAlong: {
      generateFromMarkup: prefs.readAlong?.generateFromMarkup,
      readFromPointer: prefs.readAlong?.readFromPointer,
      detachable: prefs.readAlong?.detachable
    }
  };
}

export const mapStateToPreferences = <T extends CustomizableKeys = CustomizableKeys>(
  state: PreferencesReducerState, 
  currentPrefs: ThPreferences<T>
): ThPreferences<T> => {
  const updateVariants = (stateValue: any, prefValue: any) => {
    if (!stateValue) return prefValue;
    
    return {
      ...prefValue,
      default: {
        ...prefValue?.default,
        variants: stateValue.default || prefValue?.default?.variants
      },
      ...(stateValue.breakpoints && {
        breakpoints: {
          ...prefValue?.breakpoints,
          ...Object.entries(stateValue.breakpoints).reduce((acc, [bp, value]) => {
            const existing = prefValue?.breakpoints?.[bp as ThBreakpoints] || {};
            return {
              ...acc,
              [bp]: {
                ...existing,
                variants: value
              }
            };
          }, {})
        }
      })
    };
  };

  const updatePaginatedAffordance = (stateValue: any, prefValue: any) => {
    if (!stateValue) return prefValue;
    
    return {
      ...prefValue,
      default: stateValue.default || prefValue?.default,
      ...(stateValue.breakpoints && {
        breakpoints: {
          ...prefValue?.breakpoints,
          ...Object.entries(stateValue.breakpoints).reduce((acc, [bp, value]) => ({
            ...acc,
            [bp]: value
          }), {})
        }
      })
    };
  };

  return {
    ...currentPrefs,
    theming: {
      ...currentPrefs.theming,
      ...(state.progressionFormat && {
        progression: {
          ...currentPrefs.theming.progression,
          format: {
            ...currentPrefs.theming.progression?.format,
            ...(state.progressionFormat.reflow !== undefined && {
              reflow: updateVariants(
                state.progressionFormat.reflow,
                currentPrefs.theming.progression?.format?.reflow
              )
            }),
            ...(state.progressionFormat.fxl !== undefined && {
              fxl: updateVariants(
                state.progressionFormat.fxl,
                currentPrefs.theming.progression?.format?.fxl
              )
            }),
            ...(state.progressionFormat.webPub !== undefined && {
              webPub: updateVariants(
                state.progressionFormat.webPub,
                currentPrefs.theming.progression?.format?.webPub
              )
            }),
            ...(state.progressionFormat.divina !== undefined && {
              divina: updateVariants(
                state.progressionFormat.divina,
                currentPrefs.theming.progression?.format?.divina
              )
            })
          }
        }
      }),
      ...(state.runningHeadFormat && {
        header: {
          ...currentPrefs.theming.header,
          runningHead: {
            ...currentPrefs.theming.header?.runningHead,
            format: {
              ...currentPrefs.theming.header?.runningHead?.format,
              ...(state.runningHeadFormat.reflow !== undefined && {
                reflow: updateVariants(
                  state.runningHeadFormat.reflow,
                  currentPrefs.theming.header?.runningHead?.format?.reflow
                )
              }),
              ...(state.runningHeadFormat.fxl !== undefined && {
                fxl: updateVariants(
                  state.runningHeadFormat.fxl,
                  currentPrefs.theming.header?.runningHead?.format?.fxl
                )
              }),
              ...(state.runningHeadFormat.webPub !== undefined && {
                webPub: updateVariants(
                  state.runningHeadFormat.webPub,
                  currentPrefs.theming.header?.runningHead?.format?.webPub
                )
              }),
              ...(state.runningHeadFormat.divina !== undefined && {
                divina: updateVariants(
                  state.runningHeadFormat.divina,
                  currentPrefs.theming.header?.runningHead?.format?.divina
                )
              })
            }
          }
        }
      }),
      layout: {
        ...currentPrefs.theming.layout,
        ui: state.ui 
          ? { 
              ...currentPrefs.theming.layout?.ui,
              ...state.ui 
            } 
          : currentPrefs.theming.layout?.ui
      }
    },
    affordances: {
      ...currentPrefs.affordances,
      ...(state.scrollAffordances && {
        scroll: {
          ...currentPrefs.affordances.scroll,
          ...state.scrollAffordances
        }
      }),
      ...(state.paginatedAffordances && {
        paginated: {
          reflow: updatePaginatedAffordance(state.paginatedAffordances.reflow, currentPrefs.affordances?.paginated?.reflow),
          fxl: updatePaginatedAffordance(state.paginatedAffordances.fxl, currentPrefs.affordances?.paginated?.fxl),
          divina: updatePaginatedAffordance(state.paginatedAffordances.divina, currentPrefs.affordances?.paginated?.divina)
        }
      })
    },
    ...(state.readAlong && {
      readAlong: {
        ...currentPrefs.readAlong,
        ...state.readAlong
      }
    })
  };
};