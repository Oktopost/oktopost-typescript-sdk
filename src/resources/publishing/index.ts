import type { BaseHttpClient } from '../../http/base-client.js';
import { CampaignsResource } from './campaigns.js';
import { MessagesResource } from './messages.js';
import { PostsResource } from './posts.js';
import { PostLogResource } from './post-log.js';
import { MediaResource } from './media.js';
import { UploadsResource } from './uploads.js';
import { CalendarResource } from './calendar.js';
import { TagsResource } from './tags.js';
import { LinksResource } from './links.js';

export class PublishingNamespace {
  readonly campaigns: CampaignsResource;
  readonly messages: MessagesResource;
  readonly posts: PostsResource;
  readonly postLog: PostLogResource;
  /** @deprecated use client.media.media */
  readonly media: MediaResource;
  /** @deprecated use client.media.uploads */
  readonly uploads: UploadsResource;
  readonly calendar: CalendarResource;
  readonly tags: TagsResource;
  readonly links: LinksResource;

  constructor(
    httpClient: BaseHttpClient,
    injected?: { media?: MediaResource; uploads?: UploadsResource },
  ) {
    this.campaigns = new CampaignsResource(httpClient);
    this.messages = new MessagesResource(httpClient);
    this.posts = new PostsResource(httpClient);
    this.postLog = new PostLogResource(httpClient);
    this.media = injected?.media ?? new MediaResource(httpClient);
    this.uploads = injected?.uploads ?? new UploadsResource(httpClient);
    this.calendar = new CalendarResource(httpClient);
    this.tags = new TagsResource(httpClient);
    this.links = new LinksResource(httpClient);
  }
}

export { CampaignsResource } from './campaigns.js';
export { MessagesResource } from './messages.js';
export { PostsResource } from './posts.js';
export { PostLogResource } from './post-log.js';
export { MediaResource } from './media.js';
export { UploadsResource } from './uploads.js';
export { CalendarResource, CalendarCustomEventsResource } from './calendar.js';
export { TagsResource } from './tags.js';
export { LinksResource } from './links.js';
