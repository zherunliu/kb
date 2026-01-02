# Redis

## cli

```bash
redis-cli -h <host> -p <port> -a <password>
```

## string

基本键值类型，值可以是字符串、整数、浮点数、布尔值、null

```bash
set <key> <value>
get <key> <value>

mset <key value ...>
mget <key ...>

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

# 取消过期时间
persist <key>

# 检查过期时间
ttl <key>
```

## hash

键值对的集合，一个键对应一个哈希表

```bash
hset <key> <field value ...>
hget <key> <field ...>
hgetall <key>

hsetnx <key> <field value>

hkeys <key>
hvals <key>
hlen <key>

hdel <key> <field ...>
```

## list

有序可重复的字符串列表，基于双向链表实现，按插入顺序排序

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

## set

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

## zset

有序集合，在 `set` 的基础上，每个元素关联一个分数（score），用于排序

```bash
zadd <key> <score member ...>
zrem <key> <member ...>

zrange <key> <start> <stop> [withscores]
zrevrange <key> <start> <stop>

zcount <key> <start> <stop>

zscore <key> <member>
```

## Geospatial

```bash
geoadd <key> <longitude latitude member ...>
geopos <key> <member ...>

geodist <key> <member1> <member2> [unit: m|km|ft|mi]
georadius <key> <longitude latitude> <radius> <unit> [withdist] [count <count>]
```

## HyperLogLog

```bash
pfadd <key> <elem ...>

# 去重计数
pfcount <key>

pfmerge <destkey> <sourcekey ...>
```

## BitMap

```bash
setbit <key> <offset> <value>
getbit <key> <offset>

bitcount <key> [start end]
```
