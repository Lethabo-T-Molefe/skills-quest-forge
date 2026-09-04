import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMlflowStatus, listExperiments, createExperiment, deleteExperiment,
  searchRuns, getRun, deleteRun, listModels, transitionModelStage, deleteModel, quickTrain,
  type QuickTrainInput,
} from "@/lib/api/mlflow";

const experimentsKey = ["mlflow", "experiments"] as const;
const modelsKey = ["mlflow", "models"] as const;

export function useMlflowStatus() {
  return useQuery({
    queryKey: ["mlflow", "status"],
    queryFn: getMlflowStatus,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useExperiments(enabled: boolean) {
  return useQuery({ queryKey: experimentsKey, queryFn: listExperiments, enabled, staleTime: 30 * 1000 });
}

export function useCreateExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createExperiment(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: experimentsKey }),
  });
}

export function useDeleteExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (experimentId: string) => deleteExperiment(experimentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: experimentsKey }),
  });
}

export function useRuns(experimentId: string | null, orderBy?: string) {
  return useQuery({
    queryKey: ["mlflow", "runs", experimentId, orderBy ?? null],
    queryFn: () => searchRuns(experimentId as string, orderBy),
    enabled: experimentId !== null,
    staleTime: 15 * 1000,
  });
}

export function useRun(runId: string | null) {
  return useQuery({
    queryKey: ["mlflow", "run", runId],
    queryFn: () => getRun(runId as string),
    enabled: runId !== null,
    staleTime: 15 * 1000,
  });
}

export function useDeleteRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => deleteRun(runId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mlflow", "runs"] }),
  });
}

export function useModels(enabled: boolean) {
  return useQuery({ queryKey: modelsKey, queryFn: listModels, enabled, staleTime: 30 * 1000 });
}

export function useTransitionModelStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, version, stage }: { name: string; version: string; stage: string }) =>
      transitionModelStage(name, version, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: modelsKey }),
  });
}

export function useDeleteModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteModel(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: modelsKey }),
  });
}

export function useQuickTrain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: QuickTrainInput) => quickTrain(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: experimentsKey });
      qc.invalidateQueries({ queryKey: ["mlflow", "runs"] });
      qc.invalidateQueries({ queryKey: modelsKey });
    },
  });
}
