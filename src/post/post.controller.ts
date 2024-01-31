import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getPosts(
    @Request() req: any,
    @Query() query: any,
  ): Promise<Post[] | null> {
    const { cursor, limit, q, orderBy } = query;
    return this.postService.posts(
      { id: req.user },
      req.sub,
      q,
      cursor,
      limit,
      orderBy,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getPost(@Request() req: any, @Param('id') id: string): Promise<Post> {
    return this.postService.post(
      { id: req.user },
      {
        OR: [
          {
            id: id,
          },
          {
            titleId: id,
          },
        ],
      },
      req.sub,
    );
  }
}
