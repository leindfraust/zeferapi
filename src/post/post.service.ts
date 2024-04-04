import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Post, Prisma } from '@prisma/client';
import { PostOptionsDto } from 'src/dto/post/post-options.dto';

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
    options?: PostOptionsDto,
  ): Promise<Post[]> {
    const keyword = options?.q?.split(' ').join('&');
    const userPosts = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        post: {
          where: {
            ...(options?.q &&
              options.q !== undefined && {
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
            ...(options?.seriesId &&
              options?.seriesId !== undefined && {
                series: {
                  some: {
                    id: options?.seriesId,
                  },
                },
              }),
            published: true,
          },
          ...(options?.cursor &&
            options?.cursor !== undefined && {
              cursor: {
                id: options?.cursor,
              },
              skip: 1,
            }),
          ...(options?.limit &&
            options?.limit !== undefined && {
              take: Number(options?.limit),
            }),
          ...(options?.orderBy &&
          options?.orderBy !== undefined &&
          options?.orderBy === 'most-popular'
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
