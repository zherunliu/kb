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
