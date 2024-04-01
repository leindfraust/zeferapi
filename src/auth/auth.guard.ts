import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PostService } from 'src/post/post.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private postService: PostService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    const token = authorization ? authorization.split(' ')[1] : '';
    if (!token) {
      throw new HttpException('Empty API Key', HttpStatus.BAD_REQUEST);
    }

    return this.validateApiKey(token, request);
  }

  async validateApiKey(token: string, request: any): Promise<boolean> {
    const validateUser = await this.postService.validateApiKey({
      key: token,
      isActive: true,
    });
    if (validateUser) {
      request.sub = token;
      request.user = validateUser;
      return true;
    }
    throw new HttpException(
      'Unauthorized. Incorrect API key',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
