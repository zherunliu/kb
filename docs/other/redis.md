# Redis

## cli

```bash
redis-cli -h <host> -p <port> -a <password>
```

## string

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

```bash
zadd <key> <score member ...>
zrem <key> <member ...>

zrange <key> <start> <stop> [withscores]
zrevrange <key> <start> <stop>

zcount <key> <start> <stop>

zscore <key> <member>
```
