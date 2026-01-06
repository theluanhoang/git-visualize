import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiAssistantRequestDto, AiAssistantResponseDto } from '../dto/ai-assistant.dto';
import { PracticeAggregateService } from './practice-aggregate.service';
import type { IRepositoryState } from '../../git-engine/git-engine.interface';

@Injectable()
export class PracticeAiAssistantService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly practiceAggregateService: PracticeAggregateService,
  ) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found. AI Assistant will not work properly.');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async getAiResponse(request: AiAssistantRequestDto): Promise<AiAssistantResponseDto> {
    try {
      // Validate input
      if (!request.practiceId) {
        throw new BadRequestException('Practice ID is required');
      }
      if (!request.chatMessage || !request.chatMessage.trim()) {
        throw new BadRequestException('Chat message is required');
      }
      if (!request.repoState) {
        throw new BadRequestException('Repository state is required');
      }

      // Lấy thông tin practice để hiểu context
      const practiceResult = await this.practiceAggregateService.getPractices({
        id: request.practiceId,
        includeRelations: true,
      });

      // getPractices trả về Practice object khi có id
      const practice = practiceResult as any;
      if (!practice || !practice.id) {
        throw new BadRequestException('Practice not found');
      }

      // Tạo prompt cho AI
      const prompt = this.buildPrompt(request, practice);

      // Gọi Gemini AI
      if (!this.genAI) {
        throw new BadRequestException('AI service is not configured. Please set GEMINI_API_KEY environment variable.');
      }

      const modelInstance = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash' 
      });

      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      if (!responseText || responseText.trim().length === 0) {
        throw new BadRequestException('AI returned empty response. Please try again.');
      }

      // Parse response từ AI
      return this.parseAiResponse(responseText);
    } catch (error: any) {
      // Log error để debug
      console.error('AI Assistant service error:', {
        message: error.message,
        stack: error.stack,
        practiceId: request.practiceId,
      });

      // Nếu đã là BadRequestException, throw lại
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Xử lý các lỗi từ Gemini API
      if (error.message?.includes('503') || error.message?.includes('Service Unavailable')) {
        throw new BadRequestException('AI service is temporarily unavailable. Please try again in a few moments.');
      }
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        throw new BadRequestException('AI service rate limit exceeded. Please wait a moment before trying again.');
      }
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('API key')) {
        throw new BadRequestException('AI service configuration error. Please contact administrator.');
      }
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        throw new BadRequestException('AI model not found. Please contact administrator.');
      }

      // Lỗi chung
      throw new BadRequestException(
        error.message 
          ? `Failed to get AI response: ${error.message}` 
          : 'Failed to get AI response. Please try again later.'
      );
    }
  }

  private buildPrompt(request: AiAssistantRequestDto, practice: any): string {
    const repoStateSummary = this.summarizeRepositoryState(request.repoState as any);
    
    return `🎭 BẠN LÀ TRỢ LÝ AI HỖ TRỢ THỰC HÀNH GIT

📌 VAI TRÒ:
Bạn là trợ lý AI được tích hợp trong giao diện Practice của website học Git. Bạn chỉ hoạt động trong trang Thực hành, không phải chatbot toàn hệ thống.

📌 BỐI CẢNH:
Người học đang làm bài Practice Git với:
- Git Terminal giả lập
- Commit Graph trực quan
- Danh sách file

📌 THÔNG TIN BÀI THỰC HÀNH:
- Tiêu đề: ${practice.title || 'N/A'}
- Mô tả: ${practice.scenario || 'N/A'}
- Độ khó: ${practice.difficulty || 1}/5
${practice.instructions && Array.isArray(practice.instructions) && practice.instructions.length > 0 
  ? `- Hướng dẫn: ${practice.instructions.map((i: any) => i.content || '').filter((c: string) => c).join('; ')}` 
  : ''}

📌 TRẠNG THÁI REPOSITORY HIỆN TẠI:
${repoStateSummary}

${request.userCommand ? `📌 LỆNH VỪA NHẬP: ${request.userCommand}` : ''}

${request.errorMessage ? `❌ LỖI GẶP PHẢI: ${request.errorMessage}` : ''}

📌 CÂU HỎI CỦA NGƯỜI HỌC:
${request.chatMessage}

⚠️ QUY TẮC BẮT BUỘC:
❌ KHÔNG đưa lệnh Git ngay lập tức
❌ KHÔNG giải quyết thay người học
✅ CHỈ trả lời dựa trên repoState được cung cấp
✅ Ưu tiên best practice Git
🚫 KHÔNG nói về hệ thống nội bộ hay mô hình AI

🧠 CẤU TRÚC TRẢ LỜI (BẮT BUỘC):
Bạn PHẢI trả lời theo đúng format JSON sau với 4 phần:

{
  "situationAnalysis": "Phân tích tình huống - Repository hiện tại đang ở đâu? Người học vừa làm gì?",
  "problem": "Vấn đề - Sai ở điểm nào? Vì sao cần sửa?",
  "gitKnowledge": "Kiến thức Git liên quan - Giải thích ngắn gọn, đúng trọng tâm",
  "solution": "Hướng giải quyết - Định hướng cách làm",
  "suggestedCommand": "Lệnh Git liên quan (chỉ khi thực sự cần thiết, có thể để null). Format: comment trên dòng đầu (bắt đầu bằng #), lệnh Git ở dòng tiếp theo. Ví dụ: '# Để tạo nhánh mới\\ngit branch <tên-nhánh>'",
  "warning": "Cảnh báo rủi ro (nếu có, có thể để null)"
}

⚠️ LƯU Ý QUAN TRỌNG VỀ FORMAT TEXT:
- KHÔNG sử dụng HTML tags như <br>, <p>, etc. trong JSON response
- Sử dụng \\n cho line breaks trong JSON string
- Ví dụ đúng: "Bước 1: Làm việc này\\nBước 2: Làm việc kia"
- Ví dụ sai: "Bước 1: Làm việc này<br>Bước 2: Làm việc kia"

🎙️ GIỌNG ĐIỆU:
- Như mentor ngồi cạnh
- Bình tĩnh, dễ hiểu
- Không chê bai
- Khuyến khích người học tự tìm hiểu

🔓 KHI ĐƯỢC PHÉP:
- Giải thích trước
- Đưa lệnh liên quan (nếu thực sự cần)
- Cảnh báo rủi ro nếu có

📝 FORMAT suggestedCommand (QUAN TRỌNG):
Khi đưa lệnh Git, PHẢI theo format sau:
- Dòng đầu: Comment giải thích (bắt đầu bằng #)
- Dòng tiếp theo: Lệnh Git thuần túy (chỉ lệnh, không có giải thích)

Ví dụ đúng:
# Để tạo nhánh mới từ vị trí hiện tại
git branch <tên-nhánh-mới>

Ví dụ sai (KHÔNG làm thế này):
Để tạo một nhánh mới từ vị trí hiện tại của bạn, bạn có thể sử dụng lệnh: git branch <tên-nhánh-mới>

Hãy trả lời bằng tiếng Việt, theo đúng format JSON trên.`;
  }

  private summarizeRepositoryState(repoState: IRepositoryState): string {
    const parts: string[] = [];

    // Commits
    parts.push(`- Commits: ${repoState.commits?.length || 0} commit(s)`);
    if (repoState.commits && repoState.commits.length > 0) {
      const recentCommits = repoState.commits.slice(-3);
      parts.push(`  + Các commit gần nhất:`);
      recentCommits.forEach(commit => {
        const commitId = commit.id?.substring(0, 7) || 'N/A';
        parts.push(`    • ${commitId}: "${commit.message || 'N/A'}" (branch: ${commit.branch || 'N/A'})`);
      });
    }

    // Branches
    parts.push(`- Branches: ${repoState.branches?.length || 0} branch(es)`);
    if (repoState.branches && repoState.branches.length > 0) {
      repoState.branches.forEach(branch => {
        const commitId = branch.commitId?.substring(0, 7) || 'N/A';
        parts.push(`  + ${branch.name || 'N/A'} -> ${commitId}`);
      });
    }

    // Head
    if (repoState.head) {
      if (repoState.head.type === 'branch') {
        parts.push(`- HEAD: đang ở branch "${repoState.head.ref}" (commit: ${repoState.head.commitId?.substring(0, 7) || 'N/A'})`);
      } else {
        const commitId = repoState.head.ref?.substring(0, 7) || 'N/A';
        parts.push(`- HEAD: detached HEAD tại commit ${commitId}`);
      }
    } else {
      parts.push(`- HEAD: chưa có (repository mới khởi tạo)`);
    }

    // Working directory
    if (repoState.workingDirectory && repoState.workingDirectory.length > 0) {
      parts.push(`- Working Directory: ${repoState.workingDirectory.length} file(s)`);
      repoState.workingDirectory.forEach(file => {
        parts.push(`  + ${file.path} (${file.status})`);
      });
    } else {
      parts.push(`- Working Directory: không có file nào`);
    }

    // Staging area
    if (repoState.stagingArea && repoState.stagingArea.length > 0) {
      parts.push(`- Staging Area: ${repoState.stagingArea.length} file(s) đã staged`);
      repoState.stagingArea.forEach(path => {
        parts.push(`  + ${path}`);
      });
    } else {
      parts.push(`- Staging Area: không có file nào được staged`);
    }

    return parts.join('\n');
  }

  private parseAiResponse(responseText: string): AiAssistantResponseDto {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      const response: AiAssistantResponseDto = {
        situationAnalysis: parsed.situationAnalysis || 'Không thể phân tích tình huống.',
        problem: parsed.problem || 'Không xác định được vấn đề.',
        gitKnowledge: parsed.gitKnowledge || 'Không có kiến thức Git liên quan.',
        solution: parsed.solution || 'Không có hướng giải quyết.',
        suggestedCommand: parsed.suggestedCommand || undefined,
        warning: parsed.warning || undefined,
      };

      return response;
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      return {
        situationAnalysis: 'Đang phân tích tình huống...',
        problem: 'Đang xác định vấn đề...',
        gitKnowledge: 'Đang tìm kiến thức Git liên quan...',
        solution: responseText.substring(0, 500) || 'Vui lòng thử lại.',
      };
    }
  }
}
