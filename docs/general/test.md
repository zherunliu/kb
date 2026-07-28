# Jest

## 测试结构

```typescript
describe("module", () => {
  describe("submodule", () => {
    it("should do something", () => {});
    // test("should do something", () => {});
    it.skip("skip this test", () => {});
    it.only("only run this test", () => {});
  });
});
```

## 断言

```typescript
// 基础匹配
expect(value).toBe(expected); // 严格相等 (===)
expect(value).toEqual(expected); // 深度相等（对象/数组）
expect(value).not.toBe(expected); // 取反

// 真值判断
expect(value).toBeTruthy(); // 真值
expect(value).toBeFalsy(); // 假值
expect(value).toBeNull(); // null
expect(value).toBeUndefined(); // undefined
expect(value).toBeDefined(); // 已定义

// 数字比较
expect(value).toBeGreaterThan(3); // > 3
expect(value).toBeGreaterThanOrEqual(3); // >= 3
expect(value).toBeLessThan(5); // < 5
expect(value).toBeLessThanOrEqual(5); // <= 5
expect(0.1 + 0.2).toBeCloseTo(0.3); // 浮点数近似相等

// 字符串匹配
expect(str).toMatch(/regex/); // 正则匹配
expect(str).toContain("substring"); // 包含子串
expect(str).toHaveLength(5); // 长度

// 数组/对象
expect(arr).toContain(item); // 数组包含元素
expect(arr).toContainEqual({ a: 1 }); // 数组包含匹配对象
expect(arr).toHaveLength(3); // 数组长度
expect(obj).toHaveProperty("key"); // 对象有属性
expect(obj).toHaveProperty("key", val); // 对象属性值
expect(obj).toMatchObject({ a: 1 }); // 部分匹配对象

// 异常测试
expect(() => fn()).toThrow(); // 抛出任意错误
expect(() => fn()).toThrow("error message"); // 抛出特定消息
expect(() => fn()).toThrow(ErrorType); // 抛出特定类型
expect(() => fn()).toThrowError(/regex/); // 错误匹配正则
```

## Mock

Mock 函数用于模拟函数行为，记录调用情况，方便测试

```typescript
const mockFn = jest.fn();
// const mockFn = jest.fn((x) => x + 1);

// Mock 返回值
mockFn.mockReturnValue(10); // 返回固定值
mockFn.mockReturnValueOnce(10); // 只返回一次
mockFn.mockResolvedValue(data); // 返回 Promise.resolve
mockFn.mockRejectedValue(error); // 返回 Promise.reject
mockFn.mockImplementation(fn); // 替换实现

// Mock 断言
expect(mockFn).toHaveBeenCalled(); // 被调用过
expect(mockFn).not.toHaveBeenCalled(); // 未被调用
expect(mockFn).toHaveBeenCalledTimes(2); // 调用次数
expect(mockFn).toHaveBeenCalledWith(arg1, arg2); // 调用参数
expect(mockFn).toHaveBeenLastCalledWith(arg); // 最后一次调用参数
expect(mockFn).toHaveBeenNthCalledWith(1, arg); // 第N次调用参数
expect(mockFn).toHaveReturnedWith(value); // 返回值

// Mock 属性
mockFn.mock.calls; // 所有调用参数 [[arg1, arg2], [arg1]]
mockFn.mock.calls.length; // 调用次数
mockFn.mock.results; // 所有返回值
mockFn.mock.lastCall; // 最后一次调用参数
mockFn.mockClear(); // 清除调用记录
mockFn.mockReset(); // 清除调用记录 + 返回值设置
mockFn.mockRestore(); // 仅 spyOn/replaceProperty 创建的 mock 可恢复原始实现
```

## 生命周期

- `beforeAll(() => {})` 所有测试前执行一次
- `afterAll(() => {})` 所有测试后执行一次
- `beforeEach(() => {})` 每个测试前执行
- `afterEach(() => {})` 每个测试后执行

```typescript
describe("Database", () => {
  let db;

  beforeAll(() => {
    db = connectDatabase(); // 初始化
  });

  afterAll(() => {
    db.close(); // 清理
  });

  beforeEach(() => {
    db.clear(); // 每次测试前清空
  });

  it("should insert", () => {});
});
```

## 模拟模块

```typescript
// 模拟整个模块
jest.mock("./module"); // 自动 mock
jest.mock("./module", () => ({
  // 自定义实现
  fn: jest.fn(() => "mocked"),
}));

// 模拟部分模块
jest.mock("./module", () => ({
  ...jest.requireActual("./module"), // 保留原始实现
  specificFn: jest.fn(), // 只 mock 特定函数
}));
```

## 定时器模拟

```typescript
jest.useFakeTimers(); // 启用假定时器

setTimeout(() => callback(), 1000);

jest.advanceTimersByTime(1000); // 快进 1000ms
jest.runAllTimers(); // 执行所有定时器
jest.runOnlyPendingTimers(); // 只执行待处理定时器

jest.useRealTimers(); // 恢复真实定时器
```

## 快照测试

第一次运行时会生成快照文件，后续运行会将结果与快照进行对比，以检测意外更改

```typescript
import { render } from "@testing-library/react";

it("snapshot test", () => {
  const { container } = render(<Component />);
  // 匹配快照
  expect(container).toMatchSnapshot();
  // 内联快照
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div>content</div>
  `);
});
```

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定文件
pnpm test effect.spec.ts

# 运行匹配名称的测试
pnpm test -t "scheduler"

# 监听模式
pnpm test --watch

# 查看覆盖率
pnpm test --coverage
```
