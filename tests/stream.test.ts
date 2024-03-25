import { resolve } from 'node:path';
import { createWriteStream, rmSync } from 'node:fs';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import Streams from '../src/core/stream'; // 假设 Streams 类位于这个路径
import * as helper from '../src/util/stream-helper';

vi.mock('node:fs/promises', () => ({
  rename: vi.fn().mockResolvedValue(void 0),
}));

vi.mock('node:fs', () => ({
  createWriteStream: vi.fn().mockImplementation(() => ({
    write: vi.fn((_, encoding, callback) => {
      if (typeof encoding === 'function') {
        callback = encoding;
      }
      callback && callback();
    }),
    on: vi.fn((event, handler) => {
      if (event === 'finish') handler();
      // if (event === 'end') handler();
    }),
    end: vi.fn((handler) => {
      handler();
    }),
    // 添加其他需要模拟的方法
  })),
  createReadStream: vi.fn().mockImplementation(() => ({
    pipe: vi.fn().mockReturnThis(),
    end: vi.fn(),
    on: vi.fn((event, handler) => {
      if (event === 'end') handler();
    }),
    // 添加其他需要模拟的方法
  })),
  rmSync: vi.fn(),
  rename: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
}));

vi.mock('node:stream', async () => {
  const { Readable } = await vi.importActual('node:stream');
  return {
    PassThrough: vi.fn().mockImplementation(() => ({
      pipe: vi.fn().mockReturnThis(),
      end: vi.fn(),
      on: vi.fn((event, handler) => {
        if (event === 'end') handler();
      }),
    })),
    Readable,
  };
});

describe('Streams class', () => {
  const options = {
    uuid: 'test-uuid',
    cwd: '/test',
    api: '/api',
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should initialize correctly', () => {
    const streams = new Streams(options);
    expect(streams).toBeInstanceOf(Streams);
    expect(createWriteStream).toHaveBeenCalledTimes(3); // Called for codes, typings, and imports
  });

  it('should write code correctly', async () => {
    const streams = new Streams(options);
    await streams.writeCode('test code');
    expect(streams.codes.write).toHaveBeenCalledWith('test code', expect.any(Function));
  });

  it('should write typing correctly', async () => {
    const streams = new Streams(options);
    const typing = 'type A = string';
    await streams.writeTyping(typing);
    expect(streams.typings.write).toHaveBeenCalledWith(typing, expect.any(Function));
  });

  it('should handle finishing process correctly', async () => {
    const streams = new Streams(options);
    // 假设所有文件都有写入
    streams.codes.bytesWritten = 100;
    streams.typings.bytesWritten = 50;
    streams.imports.bytesWritten = 50;

    // 调用 finished 方法
    await streams.finished('api', ['GET'], 'hoistingCode');

    // 验证是否尝试删除所有临时文件
    // 调用 rmSync 删除 codes, typings, imports 三个文件
    expect(rmSync).toHaveBeenCalledTimes(3);
    expect(rmSync).toHaveBeenCalledWith(streams.names.codes);
    expect(rmSync).toHaveBeenCalledWith(streams.names.typings);
    expect(rmSync).toHaveBeenCalledWith(streams.names.imports);
  });

  it('should remove temporary files on destroy', () => {
    const streams = new Streams(options);
    streams.destroy();
    // 验证是否尝试删除所有临时文件
    expect(rmSync).toHaveBeenCalledTimes(3); // 一次对于每个文件：codes, typings, imports
  });

  it('should write import typings when uninitialized', async () => {
    const streams = new Streams(options);
    expect(streams.status).toBe('uninitialized');
    await streams.writeImportTyping('testImportTyping');
    expect(streams.imports.write).toHaveBeenCalledWith(
      'import type {\n',
      expect.any(Function),
    );
    expect(streams.status).toBe('initialized');
  });

  it('should attempt to remove files with zero bytes written', () => {
    const streams = new Streams(options);
    streams.codes.bytesWritten = 0; // 模拟没有写入的情况
    streams.destroy();
    expect(rmSync).toHaveBeenCalledWith(streams.names.codes);
  });

  it('should handle hoisting code in finished method', async () => {
  const streams = new Streams(options);
  streams.codes.bytesWritten = 100; // 模拟已写入内容以确保流程继续

  const hoistingCode = 'const a = 1;';
  const typingFileName = resolve(streams.cwd, 'api.type.ts');

  await streams.finished('api', ['GET'], hoistingCode);

  // 验证是否为 hoistingCode 创建了新的写入流
  expect(createWriteStream).toHaveBeenCalledWith(typingFileName);
  const mockedCreateWriteStream = vi.mocked(createWriteStream);
  // 获取传递给 createWriteStream 的最后一个调用的返回值（即新创建的写入流）
  const newWriteStream =
    mockedCreateWriteStream.mock.results[mockedCreateWriteStream.mock.calls.length - 1]
      .value;

  // 验证新写入流是否用于写入 hoistingCode
  expect(newWriteStream.write).toHaveBeenCalledWith(
    helper.generatorImportCode({ api: options.api, methods: ['GET'] }),
    expect.any(Function),
  );
  });
});
