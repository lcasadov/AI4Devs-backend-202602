import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { uploadCV, sendCandidateData } from '../candidateService';

const mock = new MockAdapter(axios);

beforeEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

describe('candidateService.uploadCV', () => {
  const file = new File(['cv-content'], 'cv.pdf', { type: 'application/pdf' });

  it('posts a FormData payload to the upload endpoint and returns response data on 200', async () => {
    const responsePayload = { filePath: '/uploads/cv.pdf', fileType: 'application/pdf' };

    mock.onPost('http://localhost:3010/upload').reply((config) => {
      expect(config.data).toBeInstanceOf(FormData);
      expect(config.headers['Content-Type']).toBe('multipart/form-data');
      return [200, responsePayload];
    });

    const result = await uploadCV(file);

    expect(result).toEqual(responsePayload);
    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe('http://localhost:3010/upload');
  });

  it('throws an Error when the server responds with a 4xx status', async () => {
    mock.onPost('http://localhost:3010/upload').reply(400, { message: 'Bad Request' });

    await expect(uploadCV(file)).rejects.toThrow(Error);
  });

  it('throws an Error when the server responds with a 5xx status', async () => {
    mock.onPost('http://localhost:3010/upload').reply(500, { message: 'Server error' });

    await expect(uploadCV(file)).rejects.toThrow(Error);
  });
});

describe('candidateService.sendCandidateData', () => {
  const candidateData = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  it('posts the candidate payload to the candidates endpoint and returns response data on 200', async () => {
    const responsePayload = { id: 42, ...candidateData };

    mock.onPost('http://localhost:3010/candidates').reply((config) => {
      expect(JSON.parse(config.data)).toEqual(candidateData);
      return [200, responsePayload];
    });

    const result = await sendCandidateData(candidateData);

    expect(result).toEqual(responsePayload);
    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe('http://localhost:3010/candidates');
  });

  it('throws an Error when the server responds with a 4xx status', async () => {
    mock.onPost('http://localhost:3010/candidates').reply(422, { message: 'Validation failed' });

    await expect(sendCandidateData(candidateData)).rejects.toThrow(Error);
  });

  it('throws an Error when the server responds with a 5xx status', async () => {
    mock.onPost('http://localhost:3010/candidates').reply(500, { message: 'Server error' });

    await expect(sendCandidateData(candidateData)).rejects.toThrow(Error);
  });
});
