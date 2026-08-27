import type { BaseHttpClient } from '../../http/base-client.js';
import { PostAnalyticsResource } from './post-analytics.js';
import { FollowersResource } from './followers.js';
import { ClicksResource } from './clicks.js';
import { ExportsResource } from './exports.js';
import { DashboardsResource } from './dashboards.js';

export class AnalyticsNamespace {
  readonly postAnalytics: PostAnalyticsResource;
  readonly followers: FollowersResource;
  readonly clicks: ClicksResource;
  readonly exports: ExportsResource;
  readonly dashboards: DashboardsResource;

  constructor(httpClient: BaseHttpClient) {
    this.postAnalytics = new PostAnalyticsResource(httpClient);
    this.followers = new FollowersResource(httpClient);
    this.clicks = new ClicksResource(httpClient);
    this.exports = new ExportsResource(httpClient);
    this.dashboards = new DashboardsResource(httpClient);
  }
}

export { PostAnalyticsResource } from './post-analytics.js';
export { FollowersResource } from './followers.js';
export { ClicksResource } from './clicks.js';
export { ExportsResource } from './exports.js';
export { DashboardsResource } from './dashboards.js';
