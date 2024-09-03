import { useMemo } from "react";

import { useInteractiveQuestionContext } from "embedding-sdk/components/private/InteractiveQuestion/context";
import { useDatabaseListQuery } from "metabase/common/hooks";
import { useSelector } from "metabase/lib/redux";
import {
  isQuestionDirty,
  isQuestionRunnable,
} from "metabase/query_builder/utils/question";
import {
  Notebook as QBNotebook,
  type NotebookProps as QBNotebookProps,
} from "metabase/querying/notebook/components/Notebook";
import { getSetting } from "metabase/selectors/settings";
import { ScrollArea } from "metabase/ui";
import type Question from "metabase-lib/v1/Question";

const notebookModelFilterMap = {
  metric: "metric",
  model: "dataset",
  question: "card",
  table: "table",
} as const;

const getNotebookModelFilter = (
  models: NotebookProps["models"],
): QBNotebookProps["models"] =>
  models?.map(model => notebookModelFilterMap[model]);

export type NotebookProps = {
  onApply?: () => void;
  models?: (keyof typeof notebookModelFilterMap)[];
};

export const Notebook = ({ onApply = () => {}, models }: NotebookProps) => {
  // Loads databases and metadata, so we can show notebook steps for the selected data source
  useDatabaseListQuery();

  const modelFilterList: QBNotebookProps["models"] =
    getNotebookModelFilter(models);

  const { question, originalQuestion, updateQuestion, runQuestion } =
    useInteractiveQuestionContext();

  const isDirty = useMemo(() => {
    return isQuestionDirty(question, originalQuestion);
  }, [question, originalQuestion]);

  const isRunnable = useMemo(() => {
    return isQuestionRunnable(question, isDirty);
  }, [question, isDirty]);

  const reportTimezone = useSelector(state =>
    getSetting(state, "report-timezone-long"),
  );

  return (
    question && (
      <ScrollArea w="100%" h="100%">
        <QBNotebook
          question={question}
          isDirty={isDirty}
          isRunnable={isRunnable}
          // the visualization button relies on this boolean
          isResultDirty={true}
          reportTimezone={reportTimezone}
          readOnly={false}
          updateQuestion={async (nextQuestion: Question) =>
            await updateQuestion(nextQuestion, { run: false })
          }
          runQuestionQuery={async () => {
            await runQuestion();
            onApply();
          }}
          setQueryBuilderMode={() => {}}
          hasVisualizeButton={true}
          models={modelFilterList}
        />
      </ScrollArea>
    )
  );
};
