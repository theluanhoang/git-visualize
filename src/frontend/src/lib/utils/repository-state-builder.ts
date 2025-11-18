import { GitCommandResponse, IRepositoryState } from '@/types/git';
import { gitEngineApi } from '@/lib/react-query/hooks/use-git-engine';

export const sortCommandsByOrder = <T extends { order?: number }>(commands: T[]): T[] => {
  return [...commands].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });
};

export const filterGitCommands = (commands: Array<{ command?: string }>): string[] => {
  return commands
    .map((cmd) => cmd.command)
    .filter((cmd): cmd is string => Boolean(cmd && cmd.startsWith('git ')));
};

export const rebuildRepositoryStateFromCommands = async (
  commands: Array<{ command: string; expectedOutput?: string }>,
  initialState: IRepositoryState | null = null
): Promise<{ responses: GitCommandResponse[]; finalState: IRepositoryState | null }> => {
  let currentState: IRepositoryState | null = initialState;
  const mockResponses: GitCommandResponse[] = [];

  for (const cmd of commands) {
    if (cmd.command && cmd.command.startsWith('git ')) {
      try {
        const response = await gitEngineApi.executeGitCommand(cmd.command, currentState);
        if (response.repositoryState) {
          currentState = response.repositoryState;
        }
        mockResponses.push({
          command: cmd.command,
          success: response.success,
          output: cmd.expectedOutput || response.output || 'Command executed successfully',
          repositoryState: currentState,
        });
      } catch (error) {
        mockResponses.push({
          command: cmd.command,
          success: false,
          output: cmd.expectedOutput || 'Command executed successfully',
          repositoryState: currentState,
        });
      }
    } else {
      mockResponses.push({
        command: cmd.command,
        success: true,
        output: cmd.expectedOutput || 'Command executed successfully',
        repositoryState: currentState,
      });
    }
  }

  return { responses: mockResponses, finalState: currentState };
};

export const createMockResponsesFromCommands = (
  commands: Array<{ command: string; expectedOutput?: string }>,
  repositoryState: IRepositoryState | null
): GitCommandResponse[] => {
  return commands.map((cmd) => ({
    command: cmd.command,
    success: true,
    output: cmd.expectedOutput || 'Command executed successfully',
    repositoryState: repositoryState,
  }));
};

