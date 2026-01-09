import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RepositoryStateDto } from './repository-state.dto';

export class AiAssistantRequestDto {
  @ApiProperty({
    description: 'Lệnh Git vừa nhập của người học',
    example: 'git commit -m "Initial commit"',
  })
  @IsString()
  @IsOptional()
  userCommand?: string;

  @ApiProperty({
    description: 'Trạng thái hiện tại của repository',
    type: () => RepositoryStateDto,
  })
  @IsObject()
  repoState!: any;

  @ApiPropertyOptional({
    description: 'Thông báo lỗi (nếu có)',
    example: 'fatal: not a git repository',
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiProperty({
    description: 'ID của practice hiện tại',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  practiceId!: string;

  @ApiProperty({
    description: 'Câu hỏi hoặc tin nhắn từ người học',
    example: 'Tại sao tôi không thể commit được?',
  })
  @IsString()
  chatMessage!: string;
}

export class AiAssistantRequestBodyDto {
  @ApiProperty({
    description: 'Lệnh Git vừa nhập của người học',
    example: 'git commit -m "Initial commit"',
  })
  @IsString()
  @IsOptional()
  userCommand?: string;

  @ApiProperty({
    description: 'Trạng thái hiện tại của repository',
    type: () => RepositoryStateDto,
  })
  @IsObject()
  repoState!: any; // Sử dụng any để linh hoạt hơn với validation

  @ApiPropertyOptional({
    description: 'Thông báo lỗi (nếu có)',
    example: 'fatal: not a git repository',
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiProperty({
    description: 'Câu hỏi hoặc tin nhắn từ người học',
    example: 'Tại sao tôi không thể commit được?',
  })
  @IsString()
  chatMessage!: string;
}

export class AiAssistantResponseDto {
  @ApiProperty({
    description:
      'Phân tích tình huống - Repository hiện tại đang ở đâu? Người học vừa làm gì?',
    example:
      'Repository của bạn hiện đang ở trên branch main với 2 commits. Bạn vừa thử commit nhưng gặp lỗi.',
  })
  situationAnalysis!: string;

  @ApiProperty({
    description: 'Vấn đề - Sai ở điểm nào? Vì sao cần sửa?',
    example:
      'Lỗi xảy ra vì bạn chưa thêm file vào staging area trước khi commit. Git yêu cầu phải có ít nhất một file được staged.',
  })
  problem!: string;

  @ApiProperty({
    description:
      'Kiến thức Git liên quan - Giải thích ngắn gọn, đúng trọng tâm',
    example:
      'Git commit chỉ có thể thực hiện khi có ít nhất một file trong staging area. Staging area là nơi Git lưu các thay đổi bạn muốn commit.',
  })
  gitKnowledge!: string;

  @ApiProperty({
    description: 'Hướng giải quyết - Định hướng cách làm',
    example:
      'Bạn cần sử dụng lệnh git add để thêm file vào staging area trước. Sau đó mới có thể commit.',
  })
  solution!: string;

  @ApiPropertyOptional({
    description: 'Lệnh Git liên quan (chỉ khi được phép)',
    example: 'git add .',
  })
  suggestedCommand?: string;

  @ApiPropertyOptional({
    description: 'Cảnh báo rủi ro (nếu có)',
    example:
      'Lưu ý: git add . sẽ thêm tất cả file, kể cả file không mong muốn.',
  })
  warning?: string;
}
