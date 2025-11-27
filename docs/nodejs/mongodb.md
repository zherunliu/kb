# MongoDB

## 命令行交互

**数据库命令：**

- `show dbs` 显示所有数据库
- `use <db_name>` 切换到指定数据库
- `db` 显示当前数据库
- `db.dropDatabase()` 删除当前数据库

**集合命令：**

- `db.createCollection(<collection_name>)` 创建集合
- `show collections` 显示当前数据库的所有集合
- `db.<collection_name>.drop()` 删除指定集合
- `db.<collection_name>.renameCollection(<new_name>)` 重命名集合

**文档命令：**

- `db.<collection_name>.insert(<document>)` 插入文档
- `db.<collection_name>.find(<query>)` 查询文档
- `db.<collection_name>.update(<query>, <update>)` 更新文档（更新某个字段 `{$set:<update>}`）
- `db.<collection_name>.remove(<query>)` 删除文档

## Mongoose

```js
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/database");

/* 设置回调 */
// once：回调函数只执行一次
mongoose.connection.once("open", async () => {
  console.log("[open]");

  // 设置集合中文档属性
  const BookSchema = new mongoose.Schema({
    name: String,
    author: String,
    price: Number,
    is_hot: Boolean,
  });
  // 创建模型对象（对文档操作的封装对象）
  const BookModel = mongoose.model("books", BookSchema);
  await BookModel.create({
    name: "see the world",
    author: "rico",
    price: 20,
    is_hot: true,
  }).then(
    (data) => {
      console.log(data);
    },
    (err) => {
      console.log(err);
    }
  );
  mongoose.disconnect();
});

mongoose.connection.on("error", () => {
  console.log("[error]");
});

mongoose.connection.on("close", () => {
  console.log("[close]");
});
```

### 字段类型

- String, Number, Boolean, Array, Date, Buffer
- Mixed：任意类型，需要使用 `mongoose.Schema.Types.Mixed` 指定
- ObjectId：对象 ID，需要使用 `mongoose.Schema.Types.ObjectId` 指定
- Decimal128：高精度数字，需要使用 `mongoose.Schema.Types.Decimal128` 指定

### 字段验证

```js
const Schema = new mongoose.Schema({
  // 必填项
  title: {
    type: String,
    required: true,
  },
  // 默认值
  author: {
    type: String,
    default: "匿名",
  },
  // 枚举值
  gender: {
    type: String,
    enum: ["男", "女"],
  },
  // 唯一值
  username: {
    type: String,
    unique: true,
  },
}),
```

### CRUD

- `Model.create()`, `Model.insertOne()`
- `Model.insertMany()`
- `Model.deleteOne()`
- `Model.deleteMany()`
- `Model.updateOne()`
- `Model.updateMany()`
- `Model.find()`
- `Model.findOne()`
- `Model.findById()`

### 条件控制

**运算符：**

- `>` --> `$gt`
- `<` --> `$lt`
- `>=` --> `$gte`
- `<=` --> `$lte`
- `!==` --> `$ne` `db.students.find({id: {$gt: 3}})`

**逻辑运算：**

- `$or`
- `$and` `db.students.find({$and: [{age: {$lt: 20}}, {age: {$gt: 15}}]})`

**正则匹配：**
可以直接使用 JS 的正则语法

### 个性化读取

::: code-group

```js [字段筛选]
// 0：不要的字段
// 1：要的字段
BookModel.find()
  .select({ name: 1, author: 1 })
  .exec()
  .then(
    (data) => {
      console.log(data);
    },
    (err) => {
      console.log(err);
    }
  );
```

```js [数据排序]
// 1：升序
// -1：倒序
BookModel.find()
  .sort({ price: -1 })
  .exec()
  .then(
    (data) => {
      console.log(data);
    },
    (err) => {
      console.log(err);
    }
  );
```

```js [数据截取]
//skip() 跳过 limit() 限定
BookModel.find()
  .sort({ price: -1 })
  .skip(1)
  .limit(1)
  .exec()
  .then(
    (data) => {
      console.log(data);
    },
    (err) => {
      console.log(err);
    }
  );
```

:::

### 模块化

::: code-group

```js [index.js]
const db = require("./modules/db");
const BookModel = require("./modules/bookModel");

// 封装函数处理数据库操作返回的 Promise 异常
const exceptionHandler = (p) =>
  p.then((data) => console.log(data)).catch((err) => console.log(err));

db(() => {
  exceptionHandler(
    BookModel.find().sort({ price: -1 }).skip(1).limit(1).exec()
  );
});
```

```js [modules/db.js]
/**
 *
 * @param {*} success 数据库连接成功的回调
 * @param {*} error 数据库连接失败的回调
 */

module.exports = function (success, error) {
  const mongoose = require("mongoose");

  mongoose.connect("mongodb://127.0.0.1:27018/database");

  if (typeof error !== "function") {
    error = () => {
      console.log("Connection failed...");
    };
  }

  /* 设置回调 */
  mongoose.connection.once("open", () => {
    success();
  });

  mongoose.connection.on("error", () => {
    error();
  });

  mongoose.connection.on("close", () => {
    console.log("[close]");
  });
};
```

```js [module/bookModel.js]
const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  name: String,
  author: String,
  price: Number,
});

const BookModel = mongoose.model("books", BookSchema);

module.exports = BookModel;
```

:::
