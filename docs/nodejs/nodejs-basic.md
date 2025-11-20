# Nodejs Basic

## Buffer 操作

```js
// 创建
const buffer = Buffer.alloc(10);
const buffer = Buffer.allocUnsafe(10000);
const buffer = Buffer.from("hello, world");
// 转换
const string = buffer.toString();
// 读写
console.log(buffer[0]);
buffer[0] = 1; // 超过 255 高位舍弃
```

## fs 模块

### 文件操作

- 文件写入
  - `fs.writeFile(file, data, [options], callback)`
  - `fs.writeFileSync(file, data, [options])` （需要使用 `try...catch` 捕获）
- 追加写入
  - `fs.appendFile(file, data, [options], callback)`
  - `fs.appendFileSync(file, data, [options])`
  - `fs.writeFile(file, data, {flag: 'a'}, callback)`
- 流式写入
  - `fs.createWriteStream(file, [options])`
  ```js
    const fs = fs.require("fs");
    const ws = fs.createWriteStream('./data.txt');
    ws.write('hello, world')
    ...
    ws.end()
  ```
- 文件读取
  - `fs.readFile(file, [options], callback)`
  - `fs.readFile(file, [options])` 返回值：`string | Buffer`
- 流式读取
  - `fs.createReadStream(file, [options])`
  ```js
  const fs = fs.require("fs");
  const rs = fs.createReadStream("./data.txt");
  re.on("data", (data) => {
    console.log(data);
    console.log(data.length); // 65536 64kb
  });
  re.on("end", () => {
    console.log("Read over");
  });
  ```
- 文件移动与重命名
  - `fs.rename(oldPath, newPath, callback)`
  - `fs.renameSync(oldPath, newPath)`
- 文件删除
  - `fs.unlink(path, callback)`
  - `fs.unlinkSync(path)`
  - `fs.rm(path, callback)`
  - `fs.rmSync(path)`
- 复制文件

```js
const fs = require("fs");
// 方式一
const data = fs.readFileSync("./readme.md");
fs.writeFileSync("./readme2.md", data);

//方式二
const rs = fs.createReadStream("./readme.md");
const ws = fs.createWriteStream("./readme2.md");
rs.on("data", (chunk) => ws.write(chunk));
rs.on("end", () => {
  ws.close();
});

// 方式三
rs.pipe(ws);
```

### 文件夹操作

- 创建文件夹
  - `fs.mkdir(path, [options], callback)`
  - `fs.mkdirSync(path, [options])` （递归创建 `{recursive: true}`）
- 读取文件夹
  - `fs.readdir(path, [options], callback)`
  - `fs.readdirSync(path, [options])`
- 删除文件夹（推荐使用 `fs.rm`）
  - `fs.rmdir(path, [options], callback)`
  - `fs.rmdirSync(path, [options])` （递归删除 `{recursive: true}`）

### 查看资源状态

- `fs.stat(path, [options], callback)`
- `fs.statSync(path, [options])`

## 路径

### 相对路径

- `.` 当前目录，`./xx` 等同于 `xx`
- `..` 上级目录

### 绝对路径

- Windows: `C:\a\b\c`（根目录是磁盘符，如 `C:\`）
- Linux/Mac: `/a/b/c`（根目录是 `/`）

> - `__dirname`：当前模块文件所在目录的**绝对路径**
> - `__filename`：当前模块文件的**绝对路径和文件名**
> - `process.cwd()`：当前**工作目录**的绝对路径（执行 `node` 命令时所在的目录）

### path 模块

- `path.resolve`
- `path.sep`
- `path.parse`
- `path.basename`
- `path.dirname`
- `path.extname`
