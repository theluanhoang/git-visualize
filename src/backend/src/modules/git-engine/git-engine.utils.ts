import { randomBytes } from 'crypto';

export function generateCommitId(): string {
  return randomBytes(20).toString('hex');
}

export function shortCommitId(commitId: string, length = 7): string {
  return commitId.substring(0, length);
}

export interface ParsedArgs {
  flags: Record<string, string | boolean>;
  positionals: string[];
}

export function parseArgs(args: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    // flag dạng -m "msg"
    if (arg === "-m" && args[i + 1]) {
      flags["m"] = args[i + 1];
      i += 2;
      continue;
    }

    // flag dạng --author="Name <email>"
    if (arg.startsWith("--author=")) {
      flags["author"] = arg.substring("--author=".length).replace(/^"|"$/g, "");
      i++;
      continue;
    }

    // flag boolean như --amend
    if (arg === "--amend") {
      flags["amend"] = true;
      i++;
      continue;
    }

    // các trường hợp khác coi như positional
    positionals.push(arg);
    i++;
  }

  return { flags, positionals };
}
