import {
  OktopostError,
  OktopostApiError,
  OktopostAuthError,
  OktopostPermissionError,
  OktopostNotFoundError,
  OktopostRateLimitError,
  OktopostTimeoutError,
  type OktopostApiErrors,
} from '../../../src/http/errors.js';

describe('OktopostError', () => {
  it('sets message and name', () => {
    const error = new OktopostError('test error');
    expect(error.message).toBe('test error');
    expect(error.name).toBe('OktopostError');
    expect(error.statusCode).toBeUndefined();
  });

  it('sets statusCode when provided', () => {
    const error = new OktopostError('test', 500);
    expect(error.statusCode).toBe(500);
  });

  it('is instanceof Error', () => {
    const error = new OktopostError('test');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(OktopostError);
  });
});

describe('OktopostApiError', () => {
  it('sets message, statusCode, and errors', () => {
    const errors = { API: { Error: 'Something failed' } };
    const error = new OktopostApiError('api error', 400, errors);
    expect(error.message).toBe('api error');
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(errors);
    expect(error.name).toBe('OktopostApiError');
  });

  it('extends OktopostError', () => {
    const error = new OktopostApiError('test', 400);
    expect(error).toBeInstanceOf(OktopostError);
    expect(error).toBeInstanceOf(OktopostApiError);
  });

  it('errors field is optional', () => {
    const error = new OktopostApiError('test', 400);
    expect(error.errors).toBeUndefined();
  });

  describe('fromResponse', () => {
    it('creates error from API response with Errors', () => {
      const data = { Errors: { API: { Error: 'Not found' } } };
      const error = OktopostApiError.fromResponse(404, data);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.errors).toEqual(data.Errors);
    });

    it('uses default message when API error is missing', () => {
      const error = OktopostApiError.fromResponse(500, {});
      expect(error.message).toBe('Unknown API error');
    });

    it('uses default message when Errors.API is missing', () => {
      const error = OktopostApiError.fromResponse(500, { Errors: {} });
      expect(error.message).toBe('Unknown API error');
    });

    it('uses the first field error when API.Error is missing', () => {
      const error = OktopostApiError.fromResponse(400, {
        Errors: { Name: { Required: 'Name is required' } },
      });
      expect(error.message).toBe('Name is required');
    });

    it('skips a field group that is not an object', () => {
      const errors = { API: 'Rate limit', Name: { Required: 'Name is required' } };
      const error = OktopostApiError.fromResponse(400, {
        Errors: errors as unknown as OktopostApiErrors,
      });
      expect(error.message).toBe('Name is required');
    });

    it('keeps the default message for an Errors list', () => {
      const errors = [{ Id: 'a', ErrorField: 'Email', ErrorMessage: 'Invalid email' }];
      const error = OktopostApiError.fromResponse(400, {
        Errors: errors as unknown as OktopostApiErrors,
      });
      expect(error.message).toBe('Unknown API error');
    });
  });
});

describe('OktopostAuthError', () => {
  it('has correct defaults', () => {
    const error = new OktopostAuthError();
    expect(error.message).toBe('Authentication failed: invalid Account ID or API Key');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('OktopostAuthError');
  });

  it('accepts custom message', () => {
    const error = new OktopostAuthError('custom auth error');
    expect(error.message).toBe('custom auth error');
  });

  it('extends OktopostError', () => {
    expect(new OktopostAuthError()).toBeInstanceOf(OktopostError);
  });
});

describe('OktopostPermissionError', () => {
  it('has correct defaults', () => {
    const error = new OktopostPermissionError();
    expect(error.message).toBe('Insufficient permissions for this resource');
    expect(error.statusCode).toBe(403);
    expect(error.name).toBe('OktopostPermissionError');
  });

  it('extends OktopostApiError', () => {
    expect(new OktopostPermissionError()).toBeInstanceOf(OktopostApiError);
    expect(new OktopostPermissionError()).toBeInstanceOf(OktopostError);
  });
});

describe('OktopostNotFoundError', () => {
  it('has correct defaults', () => {
    const error = new OktopostNotFoundError();
    expect(error.message).toBe('The requested resource was not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('OktopostNotFoundError');
  });

  it('extends OktopostApiError', () => {
    expect(new OktopostNotFoundError()).toBeInstanceOf(OktopostApiError);
  });
});

describe('OktopostRateLimitError', () => {
  it('has correct defaults', () => {
    const error = new OktopostRateLimitError();
    expect(error.message).toBe('Rate limit exceeded');
    expect(error.statusCode).toBe(429);
    expect(error.name).toBe('OktopostRateLimitError');
    expect(error.limit).toBe('burst');
    expect(error.retryAfter).toBeUndefined();
  });

  it('extends OktopostApiError', () => {
    expect(new OktopostRateLimitError()).toBeInstanceOf(OktopostApiError);
    expect(new OktopostRateLimitError()).toBeInstanceOf(OktopostError);
  });
});

describe('OktopostTimeoutError', () => {
  it('has correct defaults', () => {
    const error = new OktopostTimeoutError();
    expect(error.message).toBe('Request timed out');
    expect(error.name).toBe('OktopostTimeoutError');
    expect(error.statusCode).toBeUndefined();
  });

  it('accepts custom message', () => {
    const error = new OktopostTimeoutError('custom timeout');
    expect(error.message).toBe('custom timeout');
  });

  it('extends OktopostError', () => {
    expect(new OktopostTimeoutError()).toBeInstanceOf(OktopostError);
  });
});
