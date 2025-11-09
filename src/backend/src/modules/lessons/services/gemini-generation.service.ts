import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedContent } from './content-extraction.service';
import { Language, ModelType, OutlineStyle } from '../dto/generate-lesson.dto';

export interface GenerationResult {
  html: string;
  meta: {
    model: string;
    tokens: number;
    citations: string[];
    processingTime: number;
  };
  practices?: any[];
}

@Injectable()
export class GeminiGenerationService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateLesson(
    extractedContent: ExtractedContent,
    language: Language = Language.VI,
    model: ModelType = ModelType.GEMINI_FLASH,
    outlineStyle: OutlineStyle = OutlineStyle.DETAILED,
    additionalInstructions?: string,
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const maxRetries = 3;
    const retryDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to generate lesson with practices`);
        
        const modelInstance = this.genAI.getGenerativeModel({ 
          model: model === ModelType.GEMINI_PRO ? 'gemini-2.5-pro' : 'gemini-2.5-flash' 
        });

      const prompt = this.buildPrompt(extractedContent, language, outlineStyle, additionalInstructions);
      
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();

      let html = rawText;
      let practices: any[] | undefined = undefined;
      
      try {
        const match = rawText.match(/^\s*<!--JSON\s*(\{[\s\S]*?\})\s*-->/);
        if (match) {
          const jsonPart = match[1];
          
          try {
            const parsed = JSON.parse(jsonPart);
            
            if (Array.isArray(parsed?.practices)) {
              practices = parsed.practices;
              
              if (Array.isArray(practices) && practices.length === 0) {
                console.warn('AI generated empty practices array, retrying...');
                throw new Error('Empty practices array');
              }
            } else {
              console.warn('AI did not generate practices array, retrying...');
              throw new Error('No practices array found');
            }
          } catch (jsonError) {
            console.error('Invalid JSON from AI:', jsonError.message);
            console.error('JSON content (first 500 chars):', jsonPart.substring(0, 500));
            console.error('JSON content (last 500 chars):', jsonPart.substring(Math.max(0, jsonPart.length - 500)));
            throw new Error(`Invalid JSON format from AI: ${jsonError.message}`);
          }
          
          html = rawText.replace(match[0], '').trim();
        } else {
          console.warn('AI did not include JSON comment with practices, retrying...');
          throw new Error('No practices JSON comment found');
        }
      } catch (error) {
        console.warn('JSON parse error or missing practices:', error);
        throw error;
      }

      const sanitizedHtml = this.sanitizeHtml(html);

      const processingTime = Date.now() - startTime;

      return {
        html: sanitizedHtml,
        meta: {
          model: model,
          tokens: this.estimateTokens(prompt + html),
          citations: this.extractCitations(extractedContent),
          processingTime,
        },
        ...(practices ? { practices } : {}),
      };
      } catch (error) {
        console.error(`Gemini API Error (attempt ${attempt}/${maxRetries}):`, error);
        
        if (error.message?.includes('practices') || error.message?.includes('Empty practices')) {
          console.error('AI failed to generate practices. Retrying...');
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
        }
        
        if (error.message?.includes('503 Service Unavailable')) {
          if (attempt < maxRetries) {
            console.log(`Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            throw new BadRequestException('Gemini API is temporarily overloaded. Please try again in a few minutes.');
          }
        } else if (error.message?.includes('429')) {
          if (attempt < maxRetries) {
            console.log(`Rate limit exceeded. Retrying in ${retryDelay * 2}ms... (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * 2));
            continue;
          } else {
            throw new BadRequestException('Rate limit exceeded. Please wait before trying again.');
          }
        } else if (error.message?.includes('401') || error.message?.includes('403')) {
          throw new BadRequestException('Invalid API key. Please check your GEMINI_API_KEY configuration.');
        } else if (error.message?.includes('404')) {
          throw new BadRequestException('Model not found. Please check the model name configuration.');
        } else {
          throw new BadRequestException(`Failed to generate lesson content: ${error.message}`);
        }
      }
    }
    
    throw new BadRequestException('Failed to generate lesson content after multiple attempts.');
  }

  private buildPrompt(
    extractedContent: ExtractedContent,
    language: Language,
    outlineStyle: OutlineStyle,
    additionalInstructions?: string,
  ): string {
    const isVietnamese = language === Language.VI;
    const languageName = isVietnamese ? 'Vietnamese' : 'English';
    const styleInstruction = outlineStyle === OutlineStyle.DETAILED 
      ? 'detailed explanations with step-by-step instructions' 
      : 'concise explanations with key points';

    return `
You are an expert Git instructor. Create a comprehensive lesson in ${languageName} based on the provided source content.

REQUIREMENTS:
1. Output ONLY valid HTML without any markdown or additional formatting
2. Use only these HTML tags: h1, h2, h3, h4, h5, h6, p, ul, ol, li, a, strong, em, code, pre, blockquote, hr, mark, sub, sup
3. For code blocks, use: <pre><code class="language-bash">...</code></pre> or <pre><code class="language-text">...</code></pre>
4. For inline code, use: <code>...</code>
5. For highlighting important text, use: <mark>...</mark>
6. For subscripts, use: <sub>...</sub>
7. For superscripts, use: <sup>...</sup>
8. Include practical Git examples and commands with real terminal output
9. Add exercises as task lists where appropriate using <ul><li>...</li></ul>
10. Provide ${styleInstruction}
11. Include real-world scenarios and best practices
12. Add links to official documentation when relevant
13. Structure the content with clear headings and logical flow
14. Include command examples with expected output
15. Add troubleshooting sections where relevant

SOURCE CONTENT:
Title: ${extractedContent.title}
Content: ${extractedContent.content.substring(0, 8000)}...

${additionalInstructions ? `ADDITIONAL INSTRUCTIONS: ${additionalInstructions}` : ''}

CRITICAL: You MUST generate practice sessions with complete goalRepositoryState that works with the Git Engine module.

SUPPORTED GIT COMMANDS (use ONLY these commands in expectedCommands):
- git init - Initialize a new repository
- git status - Show repository status
- git commit -m "message" - Create a commit with message (message MUST be quoted)
- git branch [name] - List branches or create new branch
- git checkout [branch] - Switch to existing branch
- git switch [branch] - Switch to existing branch
- git switch -c [branch] - Create and switch to new branch
- git clear - Clear repository state (for resetting)

STEP 1: Start your response with a JSON comment containing the practice data. Use this EXACT format:

<!--JSON {"practices":[{"title":"Practice Title","scenario":"Practice scenario","difficulty":2,"estimatedTime":15,"instructions":[{"content":"Step 1 instruction","order":1}],"hints":[{"content":"Helpful hint"}],"expectedCommands":[{"command":"git init","order":1,"isRequired":true,"expectedOutput":"Initialized empty Git repository"},{"command":"git commit -m \"Initial commit\"","order":2,"isRequired":true,"expectedOutput":"Commit created successfully"}],"validationRules":[{"type":"min_commands","value":"2"}],"tags":[{"name":"git-basics"}],"goalRepositoryState":{"commits":[{"id":"a1b2c3d4e5f6","type":"COMMIT","parents":[],"author":{"name":"Student","email":"student@example.com","date":"2024-01-01T10:00:00Z"},"committer":{"name":"Student","email":"student@example.com","date":"2024-01-01T10:00:00Z"},"message":"Initial commit","branch":"main"}],"branches":[{"name":"main","commitId":"a1b2c3d4e5f6"}],"tags":[],"head":{"type":"branch","ref":"main","commitId":"a1b2c3d4e5f6"}}]} -->

STRICT JSON RULES (MANDATORY):
- Output MUST be valid JSON according to RFC 8259.
- Use ONLY double quotes for all keys and string values.
- NO trailing commas.
- Escape all embedded quotes and special characters inside strings (e.g., newlines as \n, quotes as \").
- Do NOT include comments inside the JSON.
- Do NOT include undefined, NaN, or Infinity values.
- Ensure the JSON parses with JSON.parse in JavaScript without errors.

STEP 2: After the JSON comment, output the lesson HTML content.

MANDATORY: You MUST ALWAYS include the JSON comment with practice data. This is NOT optional.
- Minimum 1 practice session is REQUIRED
- Maximum 3 practice sessions recommended for optimal learning
- At least 1 practice is MANDATORY for every lesson

IMPORTANT: The JSON comment MUST be at the very beginning of your response, before any HTML content.
Before returning, SELF-CHECK the JSON against the STRICT JSON RULES and fix any violations.

Each practice should include:
- Realistic scenario based on the lesson content
- Step-by-step instructions that guide the user through the practice
- Helpful hints for when users get stuck
- Expected commands that users should run (with proper Git commands relevant to the lesson)
- Validation rules to ensure completion (min_commands, required_commands, etc.)
- Relevant tags for categorization (git-basics, branching, merging, etc.)
- Appropriate difficulty level (1-5)

IMPORTANT for expectedCommands:
- Commands should be in logical order (order: 1, 2, 3, etc.)
- Each command should have: command (string), order (number), isRequired (boolean), expectedOutput (string)
- Commands should be realistic and match the lesson content
- Include both required and optional commands
- Examples for different lesson types:
  * For basic lesson: git init, git commit -m "message"
  * For branching lesson: git init, git commit -m "Initial", git branch feature, git checkout feature, git commit -m "Feature work"
  * For switching lesson: git init, git commit -m "Initial", git switch -c feature, git commit -m "Feature", git switch main
- Commands should be copy-paste ready (no placeholders)
- Commit messages MUST be quoted: git commit -m "Your message here"

CRITICAL for expectedOutput:
- Each command MUST include expectedOutput field with realistic Git engine response
- Output should match what the Git Engine module would actually return
- Examples of realistic outputs:
  * git init: "Initialized empty Git repository"
  * git add file.txt: "Added file.txt to staging area"
  * git commit -m "message": "Commit created successfully"
  * git branch feature: "Branch 'feature' created"
  * git checkout feature: "Switched to branch 'feature'"
  * git switch -c feature: "Switched to branch 'feature'"
  * git status: "On branch main\nYour branch is up to date with 'origin/main'\n\nnothing to commit, working tree clean"
  * git log --oneline: "commit abc123def456 (HEAD -> main)\nAuthor: User <user@example.com>\nDate: Mon Jan 1 12:00:00 2024 +0000\n\n    Initial commit"
- Output should be consistent with Git Engine module responses
- No placeholders or generic messages - use realistic Git output

NON-NEGOTIABLE RULES:
- Absolutely EVERY item in expectedCommands MUST include a non-empty expectedOutput string
- expectedOutput MUST correspond to the command exactly and be a single, concise line unless the real command emits multi-line (e.g., git status, git log)
- Do NOT invent unsupported commands or outputs beyond the SUPPORTED GIT COMMANDS list above
- Do NOT include file system paths, timestamps, or user-specific details unless they are essential to the real output

VALIDATION CHECKLIST BEFORE YOU RESPOND (STRICT - ALL ITEMS MUST PASS):
- [ ] MANDATORY: practices array exists and has at least 1 practice
- [ ] For each practice: expectedCommands.length >= 1
- [ ] For each expectedCommands[i]: command present, order present, isRequired present (boolean), expectedOutput present (non-empty string)
- [ ] goalRepositoryState reflects the final state after ALL expectedCommands are executed in order
- [ ] All command examples only use the SUPPORTED GIT COMMANDS list
- [ ] Commit messages are quoted (git commit -m "message")
- [ ] ALL practices have complete goalRepositoryState (commits, branches, tags, head)
- [ ] JSON is syntactically valid (double quotes only, no trailing commas, strings escaped, parses via JSON.parse)
- If ANY expectedCommands entry is missing expectedOutput, REGENERATE that practice internally and only return the corrected version.
- If practices array is empty or missing, REGENERATE the entire response with at least 1 practice.

CRITICAL for goalRepositoryState:
- This represents the FINAL repository state the student should achieve after completing ALL expectedCommands
- MUST be a complete, valid Git repository state that matches the expectedCommands execution
- Structure (ALL fields required):
  * commits: Array of commits with id (string), type ("COMMIT"), parents (string[]), author, committer, message (string), branch (string)
  * branches: Array of branches with name (string) and commitId (string)
  * tags: Array of tags with name (string) and commitId (string) - can be empty []
  * head: Object with type ("branch" or "commit"), ref (string), commitId (string)
- Author/Committer structure: { name: "Student", email: "student@example.com", date: "2024-01-01T10:00:00Z" }
- Generate realistic commit IDs (12 characters hex, e.g., "a1b2c3d4e5f6", "e4f5g6h7i8j9")
- For branching lesson: Include multiple branches with different commits
- For basic lesson: Simple linear commit history
- The goal state MUST represent the final state after executing ALL expectedCommands in order
- Example for basic lesson with "git init", "git commit -m \"Initial commit\"":
  {
    "commits": [
      {
        "id": "a1b2c3d4e5f6",
        "type": "COMMIT",
        "parents": [],
        "author": {"name": "Student", "email": "student@example.com", "date": "2024-01-01T10:00:00Z"},
        "committer": {"name": "Student", "email": "student@example.com", "date": "2024-01-01T10:00:00Z"},
        "message": "Initial commit",
        "branch": "main"
      }
    ],
    "branches": [{"name": "main", "commitId": "a1b2c3d4e5f6"}],
    "tags": [],
    "head": {"type": "branch", "ref": "main", "commitId": "a1b2c3d4e5f6"}
  }
- Example for branching lesson with multiple commits and branches:
  {
    "commits": [
      {
        "id": "a1b2c3d4e5f6",
        "type": "COMMIT",
        "parents": [],
        "author": {"name": "Student", "email": "student@example.com", "date": "2024-01-01T10:00:00Z"},
        "committer": {"name": "Student", "email": "student@example.com", "date": "2024-01-01T10:00:00Z"},
        "message": "Initial commit",
        "branch": "main"
      },
      {
        "id": "b2c3d4e5f6g7",
        "type": "COMMIT",
        "parents": ["a1b2c3d4e5f6"],
        "author": {"name": "Student", "email": "student@example.com", "date": "2024-01-01T10:05:00Z"},
        "committer": {"name": "Student", "email": "student@example.com", "date": "2024-01-01T10:05:00Z"},
        "message": "Feature work",
        "branch": "feature"
      }
    ],
    "branches": [
      {"name": "main", "commitId": "a1b2c3d4e5f6"},
      {"name": "feature", "commitId": "b2c3d4e5f6g7"}
    ],
    "tags": [],
    "head": {"type": "branch", "ref": "feature", "commitId": "b2c3d4e5f6g7"}
  }

IMPORTANT: Each practice MUST include a complete goalRepositoryState that represents the final repository state after executing all expectedCommands. This goal state will be used to:
1. Show students what they need to achieve (visual goal in CommitGraph)
2. Validate their progress against the target state
3. Provide immediate feedback on their repository structure
4. Enable Goal Builder to display the target commit graph in PracticeForm
5. Visualize the target repository structure in the terminal tab

The goalRepositoryState should be realistic and match the lesson content. For example:
- Basic Git lesson: Simple linear commit history with 1-2 commits
- Branching lesson: Multiple branches with 2-3 commits total
- Switching lesson: Multiple branches with commits on different branches
- Advanced lesson: Complex branching with multiple commits per branch

VISUALIZATION REQUIREMENTS:
- Commit IDs should be unique and realistic (12-character hex strings)
- Branch names should be meaningful (main, feature, bugfix, etc.)
- Commit messages should be descriptive and educational
- The final HEAD should point to the appropriate branch based on the last command
- For branching lessons, ensure commits are properly linked via parents array
- The goal state should create an interesting and educational commit graph visualization

After that comment, output ONLY the lesson HTML. Do NOT include practice instructions in the HTML content - keep the lesson content focused on theory and examples only.

Generate a complete lesson in ${languageName} that teaches Git concepts based on this source material. Make it educational, practical, and engaging for developers learning Git. Include actual Git commands with examples and expected outputs.
`;
  }

  private sanitizeHtml(html: string): string {
    const allowedTags = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'ul', 'ol', 'li', 'a', 'strong', 'em',
      'code', 'pre', 'blockquote', 'hr', 'mark', 'sub', 'sup'
    ];

    let sanitized = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');

    sanitized = sanitized.replace(
      /<pre><code(?!\s+class=)/g, 
      '<pre><code class="language-text"'
    );

    sanitized = sanitized.replace(/\r\n/g, '\n');

    sanitized = sanitized
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<h[1-6]>\s*<\/h[1-6]>/g, '')
      .trim();

    sanitized = sanitized.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi, (_match, attrs, codeContent) => {
      let normalized = codeContent
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\r\n/g, '\n');

      normalized = normalized
        .split('\n')
        .map(line => line.replace(/\s+$/g, ''))
        .join('\n')
        .replace(/\n{2,}/g, '\n\n');

      normalized = normalized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `<pre><code${attrs}>${normalized}</code></pre>`;
    });

    return sanitized;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private extractCitations(extractedContent: ExtractedContent): string[] {
    const citations: string[] = [];
    
    if (extractedContent.metadata.source.startsWith('http')) {
      citations.push(extractedContent.metadata.source);
    }
    
    return citations;
  }
}
