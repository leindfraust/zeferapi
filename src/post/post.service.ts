import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async posts(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    token: string,
  ): Promise<Post[]> {
    const userPosts = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        post: {
          where: {
            published: true,
          },
        },
      },
    });
    if (userPosts) {
      await this.prisma.apiKey.update({
        where: {
          ownerId: userPosts.id,
          key: token,
        },
        data: {
          lastUsed: new Date(),
        },
      });
      await this.prisma.apiKeyRequest.create({
        data: {
          apiKey: {
            connect: {
              key: token,
            },
          },
          requestSize: userPosts.post.length,
        },
      });
      return userPosts.post;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async validateApiKey(
    apiKeyWhereUniqueInput: Prisma.ApiKeyWhereUniqueInput,
  ): Promise<string> {
    const validate = await this.prisma.apiKey.findUnique({
      where: apiKeyWhereUniqueInput,
    });

    if (validate) return validate.ownerId;
    return '';
  }
}
