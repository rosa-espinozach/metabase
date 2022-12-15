import React from "react";
import { t } from "ttag";

import Icon from "metabase/components/Icon";
import { Tree } from "metabase/components/tree";

import type { ITreeNodeItem } from "metabase/components/tree/types";

import {
  Root,
  LeftPaneContainer,
  TreeContainer,
  BackButton,
  RightPaneContainer,
} from "./PanePicker.styled";

interface PanePickerProps {
  data: ITreeNodeItem[];
  selectedId?: ITreeNodeItem["id"];
  onSelect: (item: ITreeNodeItem) => void;
  onBack?: () => void;
  children?: React.ReactNode;
}

function PanePicker({
  data,
  selectedId,
  onSelect,
  onBack,
  children,
}: PanePickerProps) {
  return (
    <Root>
      <LeftPaneContainer>
        {onBack && (
          <BackButton onClick={onBack}>
            <Icon name="chevronleft" className="mr1" />
            {t`Back`}
          </BackButton>
        )}
        <TreeContainer>
          <Tree selectedId={selectedId} data={data} onSelect={onSelect} />
        </TreeContainer>
      </LeftPaneContainer>
      <RightPaneContainer>{children}</RightPaneContainer>
    </Root>
  );
}

export default PanePicker;
