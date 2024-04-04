export class PostOptionsDto {
  q?: string;
  cursor?: string;
  limit?: number;
  orderBy?: 'most-popular' | 'latest';
  seriesId?: string;
}
