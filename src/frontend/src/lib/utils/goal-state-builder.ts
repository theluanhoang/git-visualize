import { GitCommandResponse, IRepositoryState } from '@/types/git';
import { gitEngineApi } from '@/lib/react-query/hooks/use-git-engine';
import { sortCommandsByOrder } from './repository-state-builder';

export const buildGoalStateFromResponses = async (
  responses: GitCommandResponse[],
  currentGoalState: IRepositoryState | null
): Promise<IRepositoryState | null> => {
  const hasValidGoalState = currentGoalState && currentGoalState.commits && currentGoalState.commits.length > 0;
  
  if (hasValidGoalState) {
    return currentGoalState;
  }

  if (responses.length > 0) {
    const lastResponse = responses[responses.length - 1];
    if (lastResponse?.repositoryState && lastResponse.repositoryState.commits?.length > 0) {
      return lastResponse.repositoryState;
    }
  }

  return null;
};

export const buildGoalStateFromCommands = async (
  commands: Array<{ command: string; order?: number }>
): Promise<IRepositoryState | null> => {
  if (commands.length === 0) {
    return null;
  }

  try {
    const sortedCommands = sortCommandsByOrder(commands);
    const commandsToExecute = sortedCommands
      .map((cmd) => cmd.command)
      .filter((cmd) => cmd && cmd.startsWith('git '));

    if (commandsToExecute.length === 0) {
      return null;
    }

    const buildResult = await gitEngineApi.buildGoalRepositoryState(commandsToExecute);
    return buildResult.repositoryState || null;
  } catch (error) {
    return null;
  }
};

export const extractGitCommandsFromResponses = (
  responses: GitCommandResponse[]
): Array<{ command: string; order: number; isRequired: boolean }> => {
  const commands = responses.map((r) => r.command).filter(Boolean) as string[];
  const gitLines = commands.filter((c) => c.startsWith('git '));
  return gitLines.map((cmd, i) => ({ command: cmd, order: i + 1, isRequired: true }));
};

