# Redis

## cli

```bash
redis-cli -h <host> -p <port> -a <password>
```

## 数据类型

### string

- 基本键值类型，值可以是字符串和数字
- Redis 的字符串对象底层编码为 `int` / `embstr` / `raw`（其中 `embstr` / `raw` 使用 SDS 保存内容），可用 `OBJECT ENCODING <key>` 查看
  - `int`：整数编码
  - `embstr`：短字符串编码，字符串对象头和 SDS 一次性分配在同一块连续内存中，减少内存碎片、访问更快
    > - Redis 8.0 中，字符串值长度不超过 44 字节时使用该编码
    > - 对现有字符串做原地修改（如 `APPEND` / `SETRANGE`）时，Redis 通常会先把它转换为 `raw`，再执行修改
  - `raw`：长字符串编码，对象头和 SDS 分开分配在不同内存块中

SDS（简单动态字符串）优点：

- O(1) 获取字符串长度，无需遍历字符串
- 支持二进制安全，可以存储包含 null 字符的字符串
- 预分配空间，拼接字符串时会检查空间是否满足要求并自动扩容

```bash
set <key> <value>
get <key>
mset <key value ...>
mget <key ...>
strlen <key>
exists <key ...>
append <key> <value>
del <key ...>

incr/decr <key>
incrby/decrby <key> <value>

# 设置过期时间
setex <key> <seconds> <value>
psetex <key> <milliseconds> <value>
expire <key> <seconds>
pexpire <key> <milliseconds>
expireat <key> <unix-time-seconds>
persist <key> # 取消过期时间
ttl <key>
```

### hash

键值对的集合，一个键对应一个哈希表

```bash
hset <key> <field value ...>
hget <key> <field>
hmget <key> <field ...>
hgetall <key>

hsetnx <key> <field value>

hkeys <key>
hvals <key>
hlen <key>

hdel <key> <field ...>
```

### list

有序可重复的字符串列表，按插入顺序排序，底层基于 quicklist 实现

```bash
lpush <key> <elem ...>
rpush <key> <elem ...>
lpop <key>
rpop <key>

# 闭区间
lrange <key> <start> <stop>

# 阻塞队列
blpop <key> <timeout>
brpop <key> <timeout>

# 切片
ltrim <key> <start> <stop>
```

### set

无序不可重复的字符串集合

```bash
sadd <key> <member ...>
srem <key> <member ...>

smembers <key>
sismember <key> <member>

# 获取成员数目
scard <key>

smove <key1> <key2> <member>

spop <key>

# 差集
sdiff <key1> <key2>
sdiffstore <key> <key1> <key2>

# 交集
sinter <key1> <key2>
sinterstore <key> <key1> <key2>

# 并集
sunion <key1> <key2>
sunionstore <key> <key1> <key2>
```

### zset

有序集合，在 `set` 的基础上，每个成员关联一个双精度浮点数分数，成员按照分数从小到大排序，分数相同时按照成员字典序排序

```bash
zadd <key> <score member ...>
zrem <key> <member ...>

zrange <key> <start> <stop> [withscores]
zrevrange <key> <start> <stop>

zcount <key> <start> <stop>

zscore <key> <member>
```

### Geospatial

存储地理位置信息，底层基于 `zset` 实现

```bash
geoadd <key> <longitude latitude member ...>
geopos <key> <member ...>

geodist <key> <member1> <member2> [unit: m|km|ft|mi]
geosearch <key> fromlonlat <longitude> <latitude> byradius <radius> <unit> [withdist] [count <count>]
```

### HyperLogLog

基于 HyperLogLog 算法实现的基数估计算法，提供不精确的去重计数（标准误差约 0.81%），适用于大数据量的去重计数场景。稀疏表示可以占用更少内存，转换为稠密表示后通常最多占用约 12KB

```bash
pfadd <key> <elem ...>

# 去重计数
pfcount <key>

pfmerge <destkey> <sourcekey ...>
```

### BitMap

一串二进制位（0 和 1），通过偏移量定位元素，底层基于 string 实现

```bash
# value 只能是 0 或 1
setbit <key> <offset> <value>
getbit <key> <offset>

bitcount <key> [start end]
bitpos <key> <value> [start end]
```

| 数据类型 | 底层实现             |
| -------- | -------------------- |
| string   | int / embstr / raw   |
| hash     | listpack / hashtable |
| list     | quicklist            |
| set      | intset / hashtable   |
| zset     | listpack / skiplist  |
