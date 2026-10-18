import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, ChatMessageQueryDto } from './chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'List all chat rooms for current user' })
  async getRooms(@CurrentUser('id') userId: string) {
    return this.chatService.getUserRooms(userId);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: 'Get paginated message history for a chat room' })
  async getRoomMessages(
    @Param('id') roomId: string,
    @CurrentUser('id') userId: string,
    @Query() query: ChatMessageQueryDto,
  ) {
    return this.chatService.getRoomMessages(roomId, userId, query);
  }

  @Post('rooms/:id/messages')
  @ApiOperation({ summary: 'Send a message in a chat room via HTTP fallback' })
  async sendMessage(
    @Param('id') roomId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(roomId, userId, dto);
  }

  @Post('rooms/:id/read')
  @ApiOperation({ summary: 'Mark all messages in a room as read' })
  async markRead(
    @Param('id') roomId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.chatService.markRoomAsRead(roomId, userId);
    return { success: true };
  }
}
