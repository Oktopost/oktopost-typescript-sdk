import { describe, it, expect } from 'vitest';
import { AnalyticsNamespace } from '../../../../src/resources/analytics/index.js';
import { PostAnalyticsResource } from '../../../../src/resources/analytics/post-analytics.js';
import { FollowersResource } from '../../../../src/resources/analytics/followers.js';
import { ClicksResource } from '../../../../src/resources/analytics/clicks.js';
import { ExportsResource } from '../../../../src/resources/analytics/exports.js';
import { DashboardsResource } from '../../../../src/resources/analytics/dashboards.js';
import { createMockHttpClient } from '../../../helpers/mock-http-client.js';

describe('AnalyticsNamespace', () => {
  it('creates all resource instances', () => {
    const http = createMockHttpClient();
    const analytics = new AnalyticsNamespace(http);

    expect(analytics.postAnalytics).toBeInstanceOf(PostAnalyticsResource);
    expect(analytics.followers).toBeInstanceOf(FollowersResource);
    expect(analytics.clicks).toBeInstanceOf(ClicksResource);
    expect(analytics.exports).toBeInstanceOf(ExportsResource);
    expect(analytics.dashboards).toBeInstanceOf(DashboardsResource);
  });
});
