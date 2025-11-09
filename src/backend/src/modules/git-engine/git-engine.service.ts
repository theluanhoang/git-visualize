import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateCommitId } from './git-engine.utils';
import { ETypeGitObject, GitCommandResponse, ICommit, IRepositoryState, PracticeValidationResponse, RepositoryDifference } from './git-engine.interface';
import { Practice } from '../practice/entities/practice.entity';

@Injectable()
export class GitEngineService {
    private repositoryState: IRepositoryState | null = null;
    private knownCommands = ['clear', 'init', 'commit', 'branch', 'checkout', 'switch', 'status', 'log', 'tag'];

    constructor(
        @InjectRepository(Practice)
        private practiceRepository: Repository<Practice>,
    ) { }

    // Stateless wrapper: run a command against a provided repository state
    executeCommandWithState(state: IRepositoryState | null | undefined, command: string): GitCommandResponse | null {
        const prev = this.repositoryState;
        this.repositoryState = state ?? null;
        try {
            const result = this.executeCommand(command);
            return result;
        } finally {
            this.repositoryState = prev;
        }
    }

    executeCommand(command: string): GitCommandResponse | null {
        const tokens = command.trim().split(/\s+/);

        if (tokens[0] !== 'git') {
            return this.response(`${tokens[0]}: command not found`, false)
        }

        tokens.shift();
        const [cmd, ...args] = tokens;

        if (!cmd) {
            return this.response("git: no command provided. See 'git --help'.", false);
        }

        if (!this.knownCommands.includes(cmd)) {
            const suggestion = this.findSimilarCommand(cmd);
            let message = `git: '${cmd}' is not a git command. See 'git --help'.`;
            if (suggestion) {
                message += `\n\nThe most similar command is\n\t${suggestion}`;
            }
            return this.response(message, false);
        }

        switch (cmd as string) {
            case 'init':
                return this.init();
            case 'status':
                return this.status();
            case 'commit':
                return this.commit(args);
            case 'branch':
                return this.branch(args);
            case 'checkout':
                return this.checkout(args);
            case 'switch':
                return this.switch(args);
            case 'clear':
                return this.clear();
            default:
                return this.response(`git: '${cmd}' not implemented yet`);
        }
    }

    private setRepositoryState(state: IRepositoryState) {
        this.repositoryState = state;
    }

    getRepositoryState(): IRepositoryState | null {
        return this.repositoryState;
    }

    private init(): GitCommandResponse {
        let message = "Reinitialized existing Git repository";
        let state = this.repositoryState;
        if (!this.repositoryState) {
            state = {
                commits: [],
                branches: [{ name: 'main', commitId: '' }],
                tags: [],
                head: { type: 'branch', ref: 'main', commitId: '' },
            };

            this.setRepositoryState(state);

            message = "Initialized empty Git repository"
        }

        return {
            success: true,
            output: message,
            repositoryState: this.repositoryState,
        };
    }

    private status(): GitCommandResponse {
        if (!this.repositoryState) {
            return {
                success: false,
                output: "fatal: not a git repository (or any of the parent directories): .git",
                repositoryState: this.repositoryState,
            };
        }

        const head = this.repositoryState.head;
        const branchName =
            head && head.type === "branch" ? head.ref : "(detached HEAD)";

        if (this.repositoryState.commits.length === 0) {
            return {
                success: true,
                output:
                    `On branch ${branchName}\n\n` +
                    `No commits yet\n\n` +
                    `nothing to commit (create/copy files and use "git add" to track)`,
                repositoryState: this.repositoryState,
            };
        }

        return {
            success: true,
            output:
                `On branch ${branchName}\n` +
                `nothing to commit, working tree clean`,
            repositoryState: this.repositoryState,
        };
    }

    private clear(): GitCommandResponse | null {
        if (!this.repositoryState) {
            return this.response(
                "fatal: not a git repository (or any of the parent directories): .git",
                false
            );
        }

        this.repositoryState = null;

        return {
            success: true,
            output: '',
            repositoryState: null
        }
    }

    private commit(args: string[]): GitCommandResponse {
        if (!this.repositoryState) {
            return this.response(
                "fatal: not a git repository (or any of the parent directories): .git",
                false
            );
        }

        const head = this.repositoryState.head;
        if (!head || head.type !== "branch") {
            return this.response("fatal: HEAD is not pointing to a branch", false);
        }

        const branchName = head.ref;
        const branch = this.repositoryState.branches.find(b => b.name === branchName);

        if (!branch) {
            return this.response(`fatal: current branch '${branchName}' not found`, false);
        }

        const messageIndex = args.indexOf("-m");
        if (messageIndex === -1 || !args[messageIndex + 1]) {
            return this.response("error: commit message not provided (use -m \"msg\")", false);
        }

        // Require quoted message after -m to match expected training UX
        // Accept either double or single quotes, and support spaces inside
        const firstToken = args[messageIndex + 1];
        const quoteChar = firstToken.startsWith('"') ? '"' : (firstToken.startsWith("'") ? "'" : null);
        if (!quoteChar) {
            return this.response("error: commit message must be quoted (use -m \"your message\")", false);
        }

        let collected: string[] = [];
        let endIndex = -1;
        for (let i = messageIndex + 1; i < args.length; i++) {
            collected.push(args[i]);
            if (args[i].endsWith(quoteChar)) {
                endIndex = i;
                break;
            }
        }

        if (endIndex === -1) {
            return this.response("error: unterminated quoted commit message", false);
        }

        // Join and strip surrounding quotes
        let message = collected.join(' ');
        if (message.length >= 2 && message.startsWith(quoteChar) && message.endsWith(quoteChar)) {
            message = message.slice(1, -1);
        }

        const commitId = generateCommitId();
        const newCommit: ICommit = {
            id: commitId,
            message,
            author: {
                name: "You",
                email: "<you@example.com>",
                date: new Date()
            },
            committer: {
                name: "You",
                email: "<you@example.com>",
                date: new Date()
            },
            parents: branch.commitId ? [branch.commitId] : [],
            type: ETypeGitObject.COMMIT,
            branch: branch.name
        };

        this.repositoryState.commits.push(newCommit);
        branch.commitId = commitId;
        this.repositoryState.head = { type: "branch", ref: branchName, commitId: branch.commitId };

        return {
            success: true,
            output: `[${branchName} ${commitId.substring(0, 7)}] ${message}`,
            repositoryState: this.repositoryState,
        };
    }

    private branch(args: string[]): GitCommandResponse {
        if (!this.repositoryState) {
            return this.response(
                "fatal: not a git repository (or any of the parent directories): .git", false
            );
        }

        const head = this.repositoryState.head;
        if (!head || head.type !== "branch") {
            return this.response("fatal: HEAD is not pointing to a branch", false);
        }

        if (args.length === 0) {
            const branchList = this.repositoryState.branches
                .map(b => {
                    const prefix = b.name === head.ref ? "*" : " ";
                    return `${prefix} ${b.name}`;
                })
                .join("\n");

            return {
                success: true,
                output: branchList,
                repositoryState: this.repositoryState,
            };
        }

        const newBranchName = args[0];

        const exists = this.repositoryState.branches.some(b => b.name === newBranchName);
        if (exists) {
            return this.response(`fatal: A branch named '${newBranchName}' already exists.`, false);
        }

        const currentBranch = this.repositoryState.branches.find(b => b.name === head.ref);
        if (!currentBranch || !currentBranch.commitId) {
            return this.response("fatal: not a valid commit to branch from", false);
        }

        this.repositoryState.branches.push({
            name: newBranchName,
            commitId: currentBranch.commitId,
        });

        return {
            success: true,
            output: "",
            repositoryState: this.repositoryState,
        };
    }

    private checkout(args: string[]): GitCommandResponse {
        if (!this.repositoryState) {
            return this.response(
                "fatal: not a git repository (or any of the parent directories): .git",
                false
            );
        }
        const head = this.repositoryState.head;

        if (!head || head.type !== "branch") {
            return this.response("fatal: HEAD is not pointing to a branch", false);
        }

        if (args.length === 0) {
            return this.response(`Your branch is up to date with '${head.ref}'.`);
        }

        const branchName = args[0];
        const branch = this.repositoryState.branches.find(b => b.name === branchName);
        if (!branch) {
            return this.response(
                `error: pathspec '${branchName}' did not match any file(s) known to git`,
                false
            );
        }
        this.repositoryState.head = { type: "branch", ref: branchName, commitId: branch.commitId };

        return {
            success: true,
            output: `Switched to branch '${branchName}'`,
            repositoryState: this.repositoryState,
        };
    }

    private switch(args: string[]): GitCommandResponse {
        if (!this.repositoryState) {
            return this.response(
                "fatal: not a git repository (or any of the parent directories): .git",
                false
            );
        }

        if (args.length === 0) {
            return this.response("fatal: missing branch or commit argument", false);
        }

        let isNewBranch = false;
        let target = "";

        if (args[0] === "-c" && args[1]) {
            isNewBranch = true;
            target = args[1];
        } else {
            target = args[0];
        }

        if (!target) {
            return this.response("fatal: missing branch or commit argument", false);
        }

        const existingBranch = this.repositoryState.branches.find(b => b.name === target);

        if (existingBranch && !isNewBranch) {
            this.repositoryState.head = {
                type: "branch",
                ref: existingBranch.name,
                commitId: existingBranch.commitId
            };
            return {
                success: true,
                output: `Switched to branch '${target}'`,
                repositoryState: this.repositoryState,
            };
        }

        if (isNewBranch) {
            const currentHead = this.repositoryState.head;
            let commitId = "";

            if (currentHead) {
                if (currentHead.type === "branch") {
                    const currentBranch = this.repositoryState.branches.find(b => b.name === currentHead.ref);
                    commitId = currentBranch?.commitId || "";
                } else if (currentHead.type === "commit") {
                    commitId = currentHead.ref;
                }
            }

            if (existingBranch) {
                return this.response(`fatal: A branch named '${target}' already exists.`, false);
            }

            this.repositoryState.branches.push({ name: target, commitId });
            this.repositoryState.head = {
                type: "branch",
                ref: target,
                commitId
            };

            return {
                success: true,
                output: `Switched to a new branch '${target}'`,
                repositoryState: this.repositoryState,
            };
        }

        const commit = this.repositoryState.commits.find(c => c.id === target);
        if (commit) {
            this.repositoryState.head = {
                type: "commit",
                ref: commit.id
            };
            return {
                success: true,
                output: `Note: switching to detached HEAD '${commit.id}'`,
                repositoryState: this.repositoryState,
            };
        }

        return this.response(`fatal: invalid reference: ${target}`, false);
    }


    private response(message: string, success?: boolean): GitCommandResponse {
        return {
            success: success ?? true,
            output: message,
            repositoryState: this.repositoryState,
        };
    }


    private findSimilarCommand(cmd: string): string | null {
        let closest: string | null = null;
        let minDistance = Infinity;

        for (const known of this.knownCommands) {
            const dist = this.levenshteinDistance(cmd, known);
            if (dist < minDistance) {
                minDistance = dist;
                closest = known;
            }
        }

        return minDistance <= 3 ? closest : null;
    }

    private levenshteinDistance(a: string, b: string): number {
        const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
            Array(b.length + 1).fill(0),
        );

        for (let i = 0; i <= a.length; i++) dp[i][0] = i;
        for (let j = 0; j <= b.length; j++) dp[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                if (a[i - 1] === b[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] =
                        1 +
                        Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                }
            }
        }

        return dp[a.length][b.length];
    }

    async validatePractice(practiceId: string, userRepositoryState: IRepositoryState): Promise<PracticeValidationResponse> {
        try {
            // Get practice with goal repository state
            const practice = await this.practiceRepository.findOne({
                where: { id: practiceId },
                select: ['id', 'title', 'goalRepositoryState']
            });

            if (!practice) {
                return {
                    success: false,
                    isCorrect: false,
                    score: 0,
                    feedback: 'Practice not found',
                    differences: [],
                    message: 'Practice not found'
                };
            }

            if (!practice.goalRepositoryState) {
                return {
                    success: false,
                    isCorrect: false,
                    score: 0,
                    feedback: 'No goal repository state defined for this practice',
                    differences: [],
                    message: 'No goal repository state defined for this practice'
                };
            }

            const goalState = practice.goalRepositoryState;
            const differences = this.compareRepositoryStates(goalState, userRepositoryState);
            const isCorrect = differences.length === 0;
            const score = this.calculateScore(goalState, userRepositoryState);

            let feedback = '';
            let message = '';

            if (isCorrect) {
                feedback = 'Perfect! Your repository state matches the goal exactly.';
                message = 'Congratulations! You have successfully completed the practice.';
            } else {
                feedback = `Found ${differences.length} difference(s) between your repository state and the goal.`;
                message = 'Your repository state is close but not exactly matching the goal.';
            }

            return {
                success: true,
                isCorrect,
                score,
                feedback,
                differences,
                message
            };

        } catch (error) {
            console.error('Error validating practice:', error);
            return {
                success: false,
                isCorrect: false,
                score: 0,
                feedback: 'An error occurred while validating your practice',
                differences: [],
                message: 'Validation failed due to an internal error'
            };
        }
    }

    private compareRepositoryStates(goalState: IRepositoryState, userState: IRepositoryState): RepositoryDifference[] {
        const differences: RepositoryDifference[] = [];

        // Compare commits
        const goalCommits = goalState.commits || [];
        const userCommits = userState.commits || [];

        if (goalCommits.length !== userCommits.length) {
            differences.push({
                type: 'commit',
                field: 'count',
                expected: goalCommits.length,
                actual: userCommits.length,
                description: `Expected ${goalCommits.length} commits, but found ${userCommits.length}`
            });
        }

        // Order-insensitive commit comparison based on messages (multiset)
        const toFrequencyMap = (arr: string[]) => {
            const map = new Map<string, number>();
            for (const s of arr) {
                map.set(s, (map.get(s) || 0) + 1);
            }
            return map;
        };

        const goalMessages = goalCommits.map(c => c.message);
        const userMessages = userCommits.map(c => c.message);

        const goalFreq = toFrequencyMap(goalMessages);
        const userFreq = toFrequencyMap(userMessages);

        // Missing messages (in goal but not in user or with fewer occurrences)
        for (const [msg, need] of goalFreq.entries()) {
            const have = userFreq.get(msg) || 0;
            if (have < need) {
                const deficit = need - have;
                differences.push({
                    type: 'commit',
                    field: 'missing_messages',
                    expected: msg,
                    actual: null,
                    description: `Missing ${deficit} commit(s) with message: "${msg}"`
                });
            }
        }

        // Extra messages (in user but not in goal or with more occurrences)
        for (const [msg, have] of userFreq.entries()) {
            const need = goalFreq.get(msg) || 0;
            if (have > need) {
                const extra = have - need;
                differences.push({
                    type: 'commit',
                    field: 'extra_messages',
                    expected: null,
                    actual: msg,
                    description: `Found ${extra} extra commit(s) with message: "${msg}"`
                });
            }
        }

        // Compare branches
        const goalBranches = goalState.branches || [];
        const userBranches = userState.branches || [];

        if (goalBranches.length !== userBranches.length) {
            differences.push({
                type: 'branch',
                field: 'count',
                expected: goalBranches.length,
                actual: userBranches.length,
                description: `Expected ${goalBranches.length} branches, but found ${userBranches.length}`
            });
        }

        // Compare branch names
        const goalBranchNames = goalBranches.map(b => b.name).sort();
        const userBranchNames = userBranches.map(b => b.name).sort();

        if (JSON.stringify(goalBranchNames) !== JSON.stringify(userBranchNames)) {
            differences.push({
                type: 'branch',
                field: 'names',
                expected: goalBranchNames,
                actual: userBranchNames,
                description: 'Branch names do not match'
            });
        }

        // Compare head
        const goalHead = goalState.head;
        const userHead = userState.head;

        if ((goalHead?.type ?? null) !== (userHead?.type ?? null)) {
            differences.push({
                type: 'head',
                field: 'type',
                expected: goalHead?.type ?? null,
                actual: userHead?.type ?? null,
                description: 'HEAD type does not match'
            });
        }

        if ((goalHead?.ref ?? null) !== (userHead?.ref ?? null)) {
            differences.push({
                type: 'head',
                field: 'ref',
                expected: goalHead?.ref ?? null,
                actual: userHead?.ref ?? null,
                description: 'HEAD reference does not match'
            });
        }

        // Compare tags
        const goalTags = goalState.tags || [];
        const userTags = userState.tags || [];

        if (goalTags.length !== userTags.length) {
            differences.push({
                type: 'tag',
                field: 'count',
                expected: goalTags.length,
                actual: userTags.length,
                description: `Expected ${goalTags.length} tags, but found ${userTags.length}`
            });
        }

        return differences;
    }

    private calculateScore(goalState: IRepositoryState, userState: IRepositoryState): number {
        const differences = this.compareRepositoryStates(goalState, userState);
        
        if (differences.length === 0) {
            return 100;
        }

        // Calculate score based on the number of differences
        // This is a simplified scoring algorithm
        const totalChecks = 4; // commits, branches, head, tags
        const penaltyPerDifference = 100 / (totalChecks * 2); // Max 50% penalty per category
        
        let penalty = 0;
        const categories = new Set(differences.map(d => d.type));
        
        for (const category of categories) {
            const categoryDifferences = differences.filter(d => d.type === category);
            penalty += Math.min(categoryDifferences.length * penaltyPerDifference, 50);
        }

        return Math.max(0, 100 - penalty);
    }
}
