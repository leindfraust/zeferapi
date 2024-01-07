import { Controller, Get, Headers } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from '@prisma/client';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(
    @Headers('authorization') authorization: string,
  ): Promise<Post[] | null> {
    const token = authorization ? authorization.split(' ')[1] : '';
    let userId: string;
    if (token) {
      const validateUser = await this.postService.validateApiKey({
        key: token,
      });
      if (validateUser) {
        userId = validateUser;
        return this.postService.posts({ id: userId }, token);
      }
      return null;
    }
    return null;
  }
}
