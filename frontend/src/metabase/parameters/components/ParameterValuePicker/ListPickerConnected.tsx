import { useEffect, useReducer } from "react";
import { t } from "ttag";

import type { Parameter, ParameterValues } from "metabase-types/api";

import { ListPicker } from "./ListPicker";
import { getFlatValueList, getListParameterStaticValues } from "./core";
import { useDebouncedCallback } from "metabase/hooks/use-debounced-callback";
import { getDefaultState, getResetKey, reducer } from "./listPickerState";

interface ListPickerConnectedProps {
  value: string | null;
  parameter: Parameter;
  onChange: (value: string | null) => void;
  fetchValues: (
    parameter: Parameter,
    query: string,
  ) => Promise<ParameterValues>;
  forceSearchItemCount: number;
  searchDebounceMs?: number;
}

// TODO should we fetch initially?
// TODO annoying onSearch when value is cleared
export function ListPickerConnected(props: ListPickerConnectedProps) {
  const {
    value,
    parameter,
    onChange,
    forceSearchItemCount,
    searchDebounceMs = 150,
    fetchValues,
  } = props;

  const [
    { values, hasMoreValues, isLoading, lastSearch, resetKey, errorMsg },
    dispatch,
  ] = useReducer(reducer, getDefaultState(value, getResetKey(parameter)));

  const fetchAndSaveValuesDebounced = useDebouncedCallback(
    async (query: string) => {
      try {
        const res = await fetchValues(parameter, query);

        dispatch({
          type: "SET_LOADED",
          payload: {
            values: getFlatValueList(res.values as string[][]),
            hasMore: res.has_more_values,
            resetKey: getResetKey(parameter),
          },
        });
      } catch (e) {
        dispatch({
          type: "SET_ERROR",
          payload: { msg: t`Loading values failed. Please try again shortly.` },
        });
      }
    },
    searchDebounceMs,
    [dispatch, fetchValues, parameter],
  );

  const cancelFetching = () => {
    fetchAndSaveValuesDebounced.cancel();
    dispatch({ type: "SET_IS_LOADING", payload: { isLoading: false } });
  };

  const ownOnSearch = (query: string) => {
    const trimmed = query.trim();

    // We have to trigger fetch only when search is different from the current value
    if (hasMoreValues && trimmed !== lastSearch) {
      // console.log(`search trimmed="${trimmed}" lastSearch="${lastSearch}"`);
      fetchAndSaveValuesDebounced.cancel();
      dispatch({
        type: "SET_IS_LOADING",
        payload: { isLoading: true, query: trimmed },
      });
      fetchAndSaveValuesDebounced(query);
    }
  };

  const ownOnChange = (value: string | null) => {
    cancelFetching();
    onChange(value);
  };

  // Reset when parameter changes
  useEffect(() => {
    const newResetKey = getResetKey(parameter);
    if (resetKey !== newResetKey) {
      dispatch({ type: "RESET", payload: { newResetKey } });
      ownOnChange(null);
    }
  }, [resetKey, parameter]);
  // Cleanup
  useEffect(() => () => cancelFetching(), []);

  const staticValues = getListParameterStaticValues(parameter);
  const enableSearch =
    !staticValues ||
    staticValues.length > forceSearchItemCount ||
    parameter.values_query_type === "search";

  return (
    <ListPicker
      value={value ?? ""}
      values={staticValues ?? values}
      onClear={() => ownOnChange(null)}
      onChange={ownOnChange}
      onSearchChange={staticValues ? undefined : ownOnSearch}
      enableSearch={enableSearch}
      placeholder={
        enableSearch ? t`Start typing to filter…` : t`Select a default value…`
      }
      isLoading={isLoading}
      noResultsText={isLoading ? t`Loading…` : t`No matching result`}
      errorMessage={errorMsg}
    />
  );
}
