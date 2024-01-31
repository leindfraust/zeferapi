import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async updateApiKey<T extends { id?: string; post: Post[] }>(
    userPosts: T,
    token: string,
  ) {
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
  }

  async posts(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    token: string,
    q?: string,
    cursor?: string,
    limit?: number,
    orderBy?: 'most-popular' | 'latest',
  ): Promise<Post[]> {
    const keyword = q?.split(' ').join('&');
    const userPosts = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        post: {
          where: {
            ...(q && {
              title: {
                search: keyword,
              },
              description: {
                search: keyword,
              },
              author: {
                search: keyword,
              },
            }),
            published: true,
          },
          ...(cursor && {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }),
          ...(limit && {
            take: Number(limit),
          }),
          ...(orderBy && orderBy === 'most-popular'
            ? {
                orderBy: {
                  views: {
                    _count: 'desc',
                  },
                },
              }
            : {
                orderBy: {
                  createdAt: 'desc',
                },
              }),
        },
      },
    });
    if (userPosts) {
      await this.updateApiKey(userPosts, token);
      return userPosts.post;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async post(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    postWhereUniqueInput: Prisma.PostWhereInput,
    token: string,
  ): Promise<Post> {
    const userPost = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        post: {
          where: postWhereUniqueInput,
        },
      },
    });
    if (userPost) {
      await this.updateApiKey(userPost, token);
      return userPost.post[0];
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
