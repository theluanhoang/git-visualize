import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateCommitId } from './git-engine.utils';
import { ETypeGitObject, FileStatus, GitCommandResponse, ICommit, IFileState, IRepositoryState, PracticeValidationResponse, RepositoryDifference } from './git-engine.interface';
import { Practice } from '../practice/entities/practice.entity';

@Injectable()
export class GitEngineService {
    private repositoryState: IRepositoryState | null = null;
    private knownCommands = ['clear', 'init', 'add', 'commit', 'branch', 'checkout', 'switch', 'status', 'log', 'tag', 'touch'];

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

        if (tokens[0] === 'touch') {
            tokens.shift();
            return this.touch(tokens);
        }

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
            case 'add':
                return this.add(args);
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
            case 'touch':
                return this.touch(args);
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
        if (!this.repositoryState) {
            const state: IRepositoryState = {
                commits: [],
                branches: [{ name: 'main', commitId: '' }],
                tags: [],
                head: { type: 'branch' as const, ref: 'main', commitId: '' },
                workingDirectory: [],
                stagingArea: [],
            };

            this.setRepositoryState(state);

            message = "Initialized empty Git repository"
        } else {
            if (!this.repositoryState.workingDirectory) {
                this.repositoryState.workingDirectory = [];
            }
            if (!this.repositoryState.stagingArea) {
                this.repositoryState.stagingArea = [];
            }
        }

        return {
            success: true,
            output: message,
            repositoryState: this.repositoryState,
        };
    }

    private add(args: string[]): GitCommandResponse {
        if (!this.repositoryState) {
            return this.response(
                "fatal: not a git repository (or any of the parent directories): .git",
                false
            );
        }

        if (!this.repositoryState.workingDirectory) {
            this.repositoryState.workingDirectory = [];
        }
        if (!this.repositoryState.stagingArea) {
            this.repositoryState.stagingArea = [];
        }

        const workingDir = this.repositoryState.workingDirectory;
        const stagingArea = this.repositoryState.stagingArea;

        let allFlag = false;
        let updateFlag = false;
        let patchFlag = false;
        const files: string[] = [];

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            switch (arg) {
                case '-A':
                case '--all':
                    allFlag = true;
                    break;
                case '-u':
                case '--update':
                    updateFlag = true;
                    break;
                case '-p':
                case '--patch':
                    patchFlag = true;
                    break;
                case '.':
                    files.push('.');
                    break;
                default:
                    if (!arg.startsWith('-')) {
                        files.push(arg);
                    }
                    break;
            }
        }

        if (allFlag) {
            return this.addAllFiles(workingDir, stagingArea);
        }

        if (updateFlag) {
            return this.addUpdatedFiles(workingDir, stagingArea);
        }

        if (patchFlag) {
            return this.addAllModifiedFiles(workingDir, stagingArea, true);
        }

        if (files.length === 0) {
            return this.response("Nothing specified, nothing added.\nhint: Use 'git add <file>...' to include in what will be committed", false);
        }

        const filesToAdd: string[] = [];
        for (const file of files) {
            if (file === '.') {
                const allFiles = workingDir
                    .filter(f => f.status === FileStatus.UNTRACKED || f.status === FileStatus.MODIFIED)
                    .map(f => f.path);
                filesToAdd.push(...allFiles);
            } else {
                filesToAdd.push(file);
            }
        }

        return this.addSpecificFiles(workingDir, stagingArea, filesToAdd);
    }

    private touch(args: string[]): GitCommandResponse {
        if (!this.repositoryState) {
            return this.response(
                "fatal: not a git repository (or any of the parent directories): .git",
                false
            );
        }

        if (args.length === 0) {
            return this.response("touch: missing file operand", false);
        }

        if (!this.repositoryState.workingDirectory) {
            this.repositoryState.workingDirectory = [];
        }
        if (!this.repositoryState.stagingArea) {
            this.repositoryState.stagingArea = [];
        }

        const workingDir = this.repositoryState.workingDirectory;
        const stagedFiles = this.repositoryState.stagingArea;

        const created: string[] = [];
        const updated: string[] = [];

        for (const filePath of args) {
            if (!filePath) {
                continue;
            }

            let file = workingDir.find(f => f.path === filePath);

            if (!file) {
                file = { path: filePath, status: FileStatus.UNTRACKED };
                workingDir.push(file);
                created.push(filePath);
                continue;
            }

            switch (file.status) {
                case FileStatus.DELETED:
                    file.status = FileStatus.UNTRACKED;
                    created.push(filePath);
                    break;
                case FileStatus.UNTRACKED:
                    // Already untracked, nothing else to do
                    break;
                case FileStatus.UNMODIFIED:
                    file.status = FileStatus.MODIFIED;
                    updated.push(filePath);
                    break;
                case FileStatus.STAGED:
                    file.status = FileStatus.MODIFIED;
                    // ensure it's still tracked in staging set; removing lets Git show unstaged changes
                    const index = stagedFiles.indexOf(file.path);
                    if (index !== -1) {
                        stagedFiles.splice(index, 1);
                    }
                    updated.push(filePath);
                    break;
                case FileStatus.MODIFIED:
                default:
                    // already marked modified; no change
                    break;
            }
        }

        if (created.length === 0 && updated.length === 0) {
            return this.response('');
        }

        const segments: string[] = [];
        if (created.length > 0) {
            segments.push(`created ${created.length} file(s): ${created.join(', ')}`);
        }
        if (updated.length > 0) {
            segments.push(`updated ${updated.length} file(s): ${updated.join(', ')}`);
        }

        return this.response(segments.join('\n'));
    }

    private addAllFiles(workingDir: IFileState[], stagingArea: string[]): GitCommandResponse {
        const added: string[] = [];
        const removed: string[] = [];

        for (const file of workingDir) {
            if (file.status === FileStatus.UNTRACKED || file.status === FileStatus.MODIFIED) {
                if (!stagingArea.includes(file.path)) {
                    stagingArea.push(file.path);
                    added.push(file.path);
                }
                file.status = FileStatus.STAGED;
            } else if (file.status === FileStatus.DELETED) {
                if (!stagingArea.includes(file.path)) {
                    stagingArea.push(file.path);
                }
                if (!removed.includes(file.path)) {
                    removed.push(file.path);
                }
            }
        }

        for (const stagedPath of [...stagingArea]) {
            const file = workingDir.find(f => f.path === stagedPath);
            if (!file) {
                const index = stagingArea.indexOf(stagedPath);
                if (index !== -1) {
                    stagingArea.splice(index, 1);
                    if (!removed.includes(stagedPath)) {
                        removed.push(stagedPath);
                    }
                }
            }
        }

        return this.formatAddResponse(added, removed);
    }

    private addUpdatedFiles(workingDir: IFileState[], stagingArea: string[]): GitCommandResponse {
        const added: string[] = [];
        const removed: string[] = [];

        for (const file of workingDir) {
            if (file.status === FileStatus.MODIFIED) {
                if (!stagingArea.includes(file.path)) {
                    stagingArea.push(file.path);
                    added.push(file.path);
                }
                file.status = FileStatus.STAGED;
            } else if (file.status === FileStatus.DELETED) {
                if (!stagingArea.includes(file.path)) {
                    stagingArea.push(file.path);
                }
                if (!removed.includes(file.path)) {
                    removed.push(file.path);
                }
            }
        }

        return this.formatAddResponse(added, removed);
    }

    private addAllModifiedFiles(workingDir: IFileState[], stagingArea: string[], isPatch: boolean): GitCommandResponse {
        const added: string[] = [];

        for (const file of workingDir) {
            if (file.status === FileStatus.MODIFIED || file.status === FileStatus.UNTRACKED) {
                if (!stagingArea.includes(file.path)) {
                    stagingArea.push(file.path);
                    added.push(file.path);
                }
                file.status = FileStatus.STAGED;
            }
        }

        if (isPatch && added.length === 0) {
            return this.response("No changes.", false);
        }

        return this.formatAddResponse(added, []);
    }

    private addSpecificFiles(workingDir: IFileState[], stagingArea: string[], filePaths: string[]): GitCommandResponse {
        const added: string[] = [];

        for (const filePath of filePaths) {
            const file = workingDir.find(f => f.path === filePath);
            
            if (file) {
                if (file.status === FileStatus.UNTRACKED || file.status === FileStatus.MODIFIED) {
                    if (!stagingArea.includes(filePath)) {
                        stagingArea.push(filePath);
                        added.push(filePath);
                    }
                    file.status = FileStatus.STAGED;
                } else if (file.status === FileStatus.DELETED) {
                    if (!stagingArea.includes(filePath)) {
                        stagingArea.push(filePath);
                    }
                    if (!added.includes(filePath)) {
                        added.push(filePath);
                    }
                } else if (file.status === FileStatus.STAGED) {
                }
            } else {
                const newFile: IFileState = {
                    path: filePath,
                    status: FileStatus.UNTRACKED
                };
                workingDir.push(newFile);
                stagingArea.push(filePath);
                newFile.status = FileStatus.STAGED;
                added.push(filePath);
            }
        }

        return this.formatAddResponse(added, []);
    }

    private formatAddResponse(added: string[], removed: string[]): GitCommandResponse {
        if (added.length === 0 && removed.length === 0) {
            return {
                success: true,
                output: '',
                repositoryState: this.repositoryState,
            };
        }

        const lines: string[] = [];
        if (added.length > 0) {
            lines.push(...added.map(f => `add '${f}'`));
        }
        if (removed.length > 0) {
            lines.push(...removed.map(f => `rm '${f}'`));
        }

        return {
            success: true,
            output: lines.join('\n'),
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

        const workingDir = this.repositoryState.workingDirectory || [];
        const stagingArea = this.repositoryState.stagingArea || [];

        const stagedFiles: string[] = [];
        const unstagedModified: string[] = [];
        const unstagedDeleted: string[] = [];
        const untrackedFiles: string[] = [];

        for (const file of workingDir) {
            if (stagingArea.includes(file.path)) {
                stagedFiles.push(file.path);
            } else if (file.status === FileStatus.MODIFIED) {
                unstagedModified.push(file.path);
            } else if (file.status === FileStatus.DELETED) {
                unstagedDeleted.push(file.path);
            } else if (file.status === FileStatus.UNTRACKED) {
                untrackedFiles.push(file.path);
            }
        }

        let output = `On branch ${branchName}\n`;

        if (this.repositoryState.commits.length === 0) {
            output += `\nNo commits yet\n`;
        }

        if (stagedFiles.length > 0) {
            output += `\nChanges to be committed:\n`;
            output += `  (use "git restore --staged <file>..." to unstage)\n`;
            for (const file of stagedFiles) {
                const fileState = workingDir.find(f => f.path === file);
                if (fileState?.status === FileStatus.DELETED) {
                    output += `\tdeleted:    ${file}\n`;
                } else {
                    output += `\tnew file:    ${file}\n`;
                }
            }
        }

        if (unstagedModified.length > 0 || unstagedDeleted.length > 0) {
            output += `\nChanges not staged for commit:\n`;
            output += `  (use "git add <file>..." to update what will be committed)\n`;
            output += `  (use "git restore <file>..." to discard changes in working directory)\n`;
            for (const file of unstagedModified) {
                output += `\tmodified:   ${file}\n`;
            }
            for (const file of unstagedDeleted) {
                output += `\tdeleted:    ${file}\n`;
            }
        }

        if (untrackedFiles.length > 0) {
            output += `\nUntracked files:\n`;
            output += `  (use "git add <file>..." to include in what will be committed)\n`;
            for (const file of untrackedFiles) {
                output += `\t${file}\n`;
            }
        }

        if (stagedFiles.length === 0 && unstagedModified.length === 0 && 
            unstagedDeleted.length === 0 && untrackedFiles.length === 0) {
            if (this.repositoryState.commits.length === 0) {
                output += `\nnothing to commit (create/copy files and use "git add" to track)`;
            } else {
                output += `\nnothing to commit, working tree clean`;
            }
        } else if (stagedFiles.length > 0) {
            output += `\n`;
        }

        return {
            success: true,
            output: output.trim(),
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

        const allowEmpty = args.includes('--allow-empty') || args.includes('--allow-empty-message');

        const stagingArea = this.repositoryState.stagingArea || [];
        const workingDir = this.repositoryState.workingDirectory || [];

        if (!allowEmpty && stagingArea.length === 0) {
            const hasChanges = workingDir.some(f => 
                f.status === FileStatus.MODIFIED || 
                f.status === FileStatus.UNTRACKED || 
                f.status === FileStatus.DELETED
            );

            if (!hasChanges) {
                return this.response(
                    "nothing to commit, working tree clean",
                    false
                );
            }

            return this.response(
                "nothing to commit (use \"git add\" to track files)",
                false
            );
        }

        const messageIndex = args.indexOf("-m");
        if (messageIndex === -1 || !args[messageIndex + 1]) {
            return this.response("error: commit message not provided (use -m \"msg\")", false);
        }

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

        const isAmend = args.includes('--amend');
        let commitId: string;
        let newCommit: ICommit;

        if (isAmend && this.repositoryState.commits.length > 0) {
            const lastCommit = this.repositoryState.commits[this.repositoryState.commits.length - 1];
            commitId = lastCommit.id; 
            newCommit = {
                ...lastCommit,
                message: message || lastCommit.message,
            };
            this.repositoryState.commits[this.repositoryState.commits.length - 1] = newCommit;
        } else {
            commitId = generateCommitId();
            newCommit = {
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
        }

        branch.commitId = commitId;
        this.repositoryState.head = { type: "branch", ref: branchName, commitId: branch.commitId };

        const stagedFiles = stagingArea.slice();
        for (const filePath of stagedFiles) {
            const file = workingDir.find(f => f.path === filePath);
            if (file) {
                if (file.status === FileStatus.DELETED) {
                    const index = workingDir.indexOf(file);
                    if (index !== -1) {
                        workingDir.splice(index, 1);
                    }
                } else {
                    file.status = FileStatus.UNMODIFIED;
                }
            }
        }
        stagingArea.length = 0;

        const output = isAmend 
            ? `[${branchName} ${commitId.substring(0, 7)}] ${message} (amend)`
            : `[${branchName} ${commitId.substring(0, 7)}] ${message}`;

        return {
            success: true,
            output,
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
            console.error('Error validating practice:', {
                practiceId,
                error,
                payload: userRepositoryState,
            });
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

        // Compare working directory
        const goalWorking = goalState.workingDirectory || [];
        const userWorking = userState.workingDirectory || [];

        const goalWorkingMap = new Map(goalWorking.map(f => [f.path, f.status]));
        const userWorkingMap = new Map(userWorking.map(f => [f.path, f.status]));

        for (const [path, status] of goalWorkingMap.entries()) {
            if (!userWorkingMap.has(path)) {
                differences.push({
                    type: 'working_directory',
                    field: 'missing_file',
                    expected: path,
                    actual: null,
                    description: `Expected working tree to contain "${path}" with status ${status}`
                });
            } else {
                const userStatus = userWorkingMap.get(path);
                if (userStatus !== status) {
                    differences.push({
                        type: 'working_directory',
                        field: 'status_mismatch',
                        expected: `${path}:${status}`,
                        actual: `${path}:${userStatus}`,
                        description: `File "${path}" expected status ${status} but found ${userStatus}`
                    });
                }
            }
        }

        for (const [path] of userWorkingMap.entries()) {
            if (!goalWorkingMap.has(path)) {
                differences.push({
                    type: 'working_directory',
                    field: 'extra_file',
                    expected: null,
                    actual: path,
                    description: `Found unexpected file "${path}" in working tree`
                });
            }
        }

        // Compare staging area
        const goalStaging = goalState.stagingArea || [];
        const userStaging = userState.stagingArea || [];

        const goalStagingSet = new Set(goalStaging);
        const userStagingSet = new Set(userStaging);

        for (const path of goalStagingSet) {
            if (!userStagingSet.has(path)) {
                differences.push({
                    type: 'staging_area',
                    field: 'missing_staged_file',
                    expected: path,
                    actual: null,
                    description: `Expected "${path}" to be staged`
                });
            }
        }

        for (const path of userStagingSet) {
            if (!goalStagingSet.has(path)) {
                differences.push({
                    type: 'staging_area',
                    field: 'extra_staged_file',
                    expected: null,
                    actual: path,
                    description: `Found staged file "${path}" not expected in goal state`
                });
            }
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
        const totalChecks = 6; // commits, branches, head, tags, working dir, staging
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
