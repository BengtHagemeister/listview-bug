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
// import { Checkbox } from "@react-spectrum/checkbox";
// import ChevronLeftMedium from "@spectrum-icons/ui/ChevronLeftMedium";
// import ChevronRightMedium from "@spectrum-icons/ui/ChevronRightMedium";
// import { classNames, ClearSlots, SlotProvider } from "@react-spectrum/utils";
// import { Content } from "@react-spectrum/view";
// import { Grid } from "@react-spectrum/layout";
import { ListViewContext } from "./ListView";
import { mergeProps } from "@react-aria/utils";
import React, { useContext, useRef } from "react";
import { useFocusRing } from "@react-aria/focus";
import {
  useGridCell,
  useGridRow,
  useGridSelectionCheckbox,
} from "@react-aria/grid";
import { useHover, usePress } from "@react-aria/interactions";
import { useLocale } from "@react-aria/i18n";

export function ListViewItem(props: any) {
  let { item, onAction } = props;
  let cellNode = [...item.childNodes][0];
  let { state }: any = useContext(ListViewContext);
  let { direction } = useLocale();
  let rowRef: any = useRef<HTMLDivElement>();
  let cellRef: any = useRef<HTMLDivElement>();
  let { isFocusVisible: isFocusVisibleWithin, focusProps: focusWithinProps } =
    useFocusRing({ within: true });
  let { isFocusVisible, focusProps } = useFocusRing();
  let allowsInteraction =
    state.selectionManager.selectionMode !== "none" || onAction;
  let isDisabled = !allowsInteraction || state.disabledKeys.has(item.key);
  let { hoverProps, isHovered } = useHover({ isDisabled });
  let { pressProps, isPressed } = usePress({ isDisabled });
  let { rowProps } = useGridRow(
    {
      node: item,
      isVirtualized: true,
    },
    state,
    rowRef
  );
  let { gridCellProps } = useGridCell(
    {
      node: cellNode,
      focusMode: "cell",
    },
    state,
    cellRef
  );
  const mergedProps = mergeProps(
    gridCellProps,
    hoverProps,
    focusWithinProps,
    focusProps
  );
  let { checkboxProps } = useGridSelectionCheckbox(
    { ...props, key: item.key },
    state
  );

  let chevron = null;

  let showCheckbox =
    state.selectionManager.selectionMode !== "none" &&
    state.selectionManager.selectionBehavior === "toggle";
  let isSelected = state.selectionManager.isSelected(item.key);

  console.log("rendered");
  return (
    <div {...mergeProps(rowProps, pressProps)} ref={rowRef}>
      <div ref={cellRef} {...mergedProps}>
        <div>
          {/* {showCheckbox && <Checkbox {...checkboxProps} isEmphasized />} */}
          {/* <SlotProvider
            slots={{
              content: {},
              text: {},
              description: {},
              icon: {
                size: "M",
              },
              image: {},
              link: {
                isQuiet: true,
              },
              actionButton: {
                isQuiet: true,
              },
              actionGroup: {
                isQuiet: true,
                density: "compact",
              },
            }}
          > */}
          {typeof item.rendered === "string" ? (
            <div>{item.rendered}</div>
          ) : (
            item.rendered
          )}
          {/* <ClearSlots>{chevron}</ClearSlots> */}
          {/* </SlotProvider> */}
        </div>
      </div>
    </div>
  );
}
