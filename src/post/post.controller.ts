import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getPosts(@Request() req: any): Promise<Post[] | null> {
    return this.postService.posts({ id: req.user }, req.sub);
  }
}
