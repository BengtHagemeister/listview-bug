/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  AriaLabelingProps,
  CollectionBase,
  DOMProps,
  DOMRef,
  LoadingState,
  MultipleSelection,
  StyleProps,
} from "@react-types/shared";
import { classNames, useDOMRef, useStyleProps } from "@react-spectrum/utils";
import { GridCollection, useGridState } from "@react-stately/grid";
import { GridKeyboardDelegate, useGrid } from "@react-aria/grid";
// @ts-ignore
import { ListLayout } from "@react-stately/layout";
import { ListState, useListState } from "@react-stately/list";
import { ListViewItem } from "./ListViewItem";
// import { ProgressCircle } from "@react-spectrum/progress";
import React, { ReactElement, useContext, useMemo } from "react";
import { useCollator, useLocale, useMessageFormatter } from "@react-aria/i18n";
// import { useProvider } from "@react-spectrum/provider";
import { Virtualizer } from "@react-aria/virtualizer";

export const ListViewContext = React.createContext(null);

const ROW_HEIGHTS = {
  compact: {
    medium: 32,
    large: 40,
  },
  regular: {
    medium: 40,
    large: 50,
  },
  spacious: {
    medium: 48,
    large: 60,
  },
};

export function useListLayout<T>(
  state: ListState<T>,
  density: ListViewProps<T>["density"]
) {
  let collator = useCollator({ usage: "search", sensitivity: "base" });
  let layout = useMemo(
    () =>
      new ListLayout<T>({
        //@ts-expect-error
        estimatedRowHeight: ROW_HEIGHTS[density]["medium"],
        padding: 0,
        collator,
      }),
    [collator, density]
  );

  layout.collection = state.collection;
  layout.disabledKeys = state.disabledKeys;
  return layout;
}

interface ListViewProps<T>
  extends CollectionBase<T>,
    DOMProps,
    AriaLabelingProps,
    StyleProps,
    MultipleSelection {
  /**
   * Sets the amount of vertical padding within each cell.
   * @default 'regular'
   */
  density?: "compact" | "regular" | "spacious";
  isQuiet?: boolean;
  loadingState?: LoadingState;
  renderEmptyState?: () => JSX.Element;
  transitionDuration?: number;
  onAction?: (key: string) => void;
}

function ListView<T extends object>(
  props: ListViewProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {
    density = "regular",
    loadingState,
    isQuiet,
    transitionDuration = 0,
    onAction,
  } = props;
  let domRef = useDOMRef(ref);
  let { collection } = useListState(props);

  let { styleProps } = useStyleProps(props);
  let { direction } = useLocale();
  let collator = useCollator({ usage: "search", sensitivity: "base" });
  let gridCollection = useMemo(
    () =>
      new GridCollection({
        columnCount: 1,
        //@ts-expect-error
        items: [...collection].map((item) => ({
          ...item,
          hasChildNodes: true,
          childNodes: [
            {
              key: `cell-${item.key}`,
              type: "cell",
              index: 0,
              value: null,
              level: 0,
              rendered: null,
              textValue: item.textValue,
              hasChildNodes: false,
              childNodes: [],
            },
          ],
        })),
      }),
    [collection]
  );
  let state = useGridState({
    ...props,
    //@ts-expect-error
    collection: gridCollection,
    focusMode: "cell",
  });
  let layout = useListLayout(state, props.density || "regular");
  let keyboardDelegate = useMemo(
    () =>
      new GridKeyboardDelegate({
        collection: state.collection,
        disabledKeys: state.disabledKeys,
        ref: domRef,
        direction,
        collator,
        // Focus the ListView cell instead of the row so that focus doesn't change with left/right arrow keys when there aren't any
        // focusable children in the cell.
        focusMode: "cell",
      }),
    [state, domRef, direction, collator]
  );
  let { gridProps } = useGrid(
    {
      ...props,
      isVirtualized: true,
      keyboardDelegate,
    },
    state,
    domRef
  );

  // Sync loading state into the layout.
  layout.isLoading = loadingState === "loading";

  let focusedKey = state.selectionManager.focusedKey;
  let focusedItem = gridCollection.getItem(state.selectionManager.focusedKey);
  if (focusedItem?.parentKey != null) {
    focusedKey = focusedItem.parentKey;
  }

  return (
    //@ts-expect-error
    <ListViewContext.Provider value={{ state, keyboardDelegate }}>
      <Virtualizer
        {...gridProps}
        {...styleProps}
        ref={domRef}
        focusedKey={focusedKey}
        scrollDirection="vertical"
        layout={layout}
        //@ts-expect-error
        collection={gridCollection}
        transitionDuration={transitionDuration}
      >
        {(type, item) => {
          if (type === "item") {
            return <ListViewItem item={item} onAction={onAction} />;
          } else if (type === "loader") {
            return <CenteredWrapper></CenteredWrapper>;
          } else if (type === "placeholder") {
            let emptyState = props.renderEmptyState
              ? props.renderEmptyState()
              : null;
            if (emptyState == null) {
              return null;
            }

            return <CenteredWrapper>{emptyState}</CenteredWrapper>;
          }
        }}
      </Virtualizer>
    </ListViewContext.Provider>
  );
}

function CenteredWrapper({ children }: any) {
  let { state }: any = useContext(ListViewContext);
  return (
    <div role="row" aria-rowindex={state.collection.size + 1}>
      <div role="gridcell">{children}</div>
    </div>
  );
}

const _ListView = React.forwardRef(ListView) as <T>(
  props: ListViewProps<T> & { ref?: DOMRef<HTMLDivElement> }
) => ReactElement;
export { _ListView as ListView };
