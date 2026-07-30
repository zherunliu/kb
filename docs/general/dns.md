# DNS

DNS 可以从三个角度理解：

- **命名空间**：`www.example.com.` 是一棵倒置树上的路径，最右侧不可见的空标签是根 `.`
- **分布式数据库**：不同组织只维护自己负责的区域，通过委派连接成完整的命名空间
- **查询协议**：客户端用“名称 + 记录类型”提问，服务器返回资源记录、转介或错误

`www.example.com.` 可以拆成：

```plain
.                   根
└── com             顶级域（TLD）
    └── example     二级域
        └── www     主机/节点标签
```

末尾的 `.` 表示根，所以 `www.example.com.` 是严格意义上的 FQDN（Fully Qualified Domain Name）

## 角色模型

以浏览器访问 `www.example.com` 为例：

```plain
应用程序
  │  系统解析 API
  ▼
存根解析器（stub resolver，通常位于操作系统）
  │  发送 DNS 查询，通常设置 RD=1
  ▼
递归解析器（recursive resolver，带缓存）
  ├── 根服务器：去问 .com 的服务器
  ├── .com 服务器：去问 example.com 的服务器
  └── example.com 权威服务器：www.example.com 的 A 是 192.0.2.10
  │
  ▼
应用得到 192.0.2.10，再建立 TCP/QUIC 与 TLS/HTTP 连接
```

### 存根解析器

应用通常不会自己遍历根、顶级域和权威服务器，而是调用操作系统提供的名称解析接口，例如 `getaddrinfo()`，请求把主机名解析为可连接的地址。系统的存根解析器随后向配置好的递归解析器发送 DNS 查询，通常设置 `RD=1`，表示希望对方完成后续解析并返回最终结果

有些系统会先把查询交给本机的缓存或转发服务：缓存命中时可直接返回结果，未命中时再由该服务访问上游递归解析器。系统名称解析接口不一定只使用 DNS，也可能按照系统配置查询 `hosts` 文件、mDNS 等其他名称来源，此外，启用内置 DoH 的浏览器可能绕过系统存根解析器，直接向 DoH 服务发送查询

### 递归解析器

递归解析器可能来自家庭路由器、公司内网、运营商或公共 DNS 服务

递归解析器解析流程：

1. 检查缓存
2. 缓存未命中时，执行一连串迭代查询
3. 跟随 NS（Name Server）转介和 CNAME/DNAME 别名
4. 按 TTL 缓存正面或负面结果
5. 如果启用了 DNSSEC 验证，验证签名链
6. 可能根据企业或安全策略改写、拦截某些结果

### 权威服务器

权威服务器保存某个区域的数据，并对该区域给出权威答案。一个区域通常有多个权威服务器，一台服务器也可以托管许多区域

### 一次完整解析

假设递归解析器的缓存为空，要查询 `www.example.com. A`：

1. 存根解析器向递归解析器发送查询，通常设置 `RD=1`（Recursion Desired）
2. 递归解析器从本地配置的 root hints 得到根服务器地址，向某个根服务器查询
3. 根服务器不返回最终 A 记录，而是在 Authority 区域返回 `.com` 的 NS 转介，并可能在 Additional 区域返回对应 glue
4. 递归解析器向某个 `.com` 权威服务器查询
5. `.com` 服务器返回 `example.com` 的 NS 转介及必要的 glue
6. 递归解析器向 `example.com` 权威服务器查询
7. 权威服务器返回 A 记录，或先返回 CNAME；若有 CNAME，递归解析器继续解析其目标名称
8. 递归解析器缓存沿途可缓存的数据，并向存根解析器返回最终结果

## 资源记录

DNS 数据的基本单位是 Resource Record（RR）。常见展示形式为：

```plain
NAME                 TTL     CLASS   TYPE    RDATA
www.example.com.     300     IN      A       192.0.2.10
```

- `NAME`：记录所属名称
- `TTL`：递归解析器最多可缓存多少秒；输出中的 TTL 往往是剩余时间
- `CLASS`：互联网 DNS 基本都是 `IN`
- `TYPE`：记录类型
- `RDATA`：随类型变化的记录值

同一个 owner name、class、type 的多条记录组成一个 **RRset**。DNSSEC 对 RRset 整体签名，而不是孤立地签每一条记录

| 类型                    | 作用                         | 示例或注意点                                                 |
| ----------------------- | ---------------------------- | ------------------------------------------------------------ |
| `A`                     | 名称 -> IPv4                 | `192.0.2.10`                                                 |
| `AAAA`                  | 名称 -> IPv6                 | `2001:db8::10`                                               |
| `CNAME`                 | 别名 -> 规范名称             | 查询端还需继续解析目标；CNAME owner 通常不能再有其他普通数据 |
| `NS`                    | 指定区域的权威服务器         | RDATA 是服务器名称，不是 IP                                  |
| `MX`                    | 指定邮件服务器               | 数字越小优先级越高；目标应是可解析的名称                     |
| `TXT`                   | 任意文本                     | 常承载域名验证、SPF 等信息，不是只给人看的注释               |
| `SOA`                   | 区域起始与管理参数           | 包含主服务器名、序列号、刷新/重试时间和负缓存相关 TTL        |
| `PTR`                   | 反向解析：IP -> 名称         | IPv4 使用 `in-addr.arpa`，IPv6 使用 `ip6.arpa`               |
| `CAA`                   | 限制哪些 CA 可为域名签发证书 | 属于证书签发策略，不返回证书本身                             |
| `DS`、`DNSKEY`、`RRSIG` | DNSSEC 信任链和签名验证      | 不提供查询内容的保密性                                       |

## DNS 报文

请求和响应共用同一种报文结构：

```plain
Header
Question     询问的名称、类型和 class
Answer       直接回答问题的记录
Authority    权威依据、转介 NS，或负面答案中的 SOA
Additional   有助于继续查询的补充记录，以及 EDNS OPT 伪记录
```

### 常用 Header 标志

| 标志 | 含义                                                                     |
| ---- | ------------------------------------------------------------------------ |
| `qr` | 这是响应而不是查询                                                       |
| `aa` | 回答服务器对该答案具有权威性                                             |
| `tc` | UDP 响应被截断，客户端通常应改用 TCP 或调整 EDNS 行为                    |
| `rd` | 查询方希望服务器递归解析                                                 |
| `ra` | 服务器声明自己支持递归                                                   |
| `ad` | 验证解析器认为答案通过 DNSSEC 验证；只有在可信解析器与可信链路上才可依赖 |
| `cd` | 查询方要求递归解析器暂不执行 DNSSEC 验证检查                             |

### 常见返回状态

| 状态                   | 含义                                        | 排查方向                                     |
| ---------------------- | ------------------------------------------- | -------------------------------------------- |
| `NOERROR` 且有 Answer  | 查询成功                                    | 检查记录值、TTL、是否权威                    |
| `NOERROR` 但无目标记录 | 名称存在，但请求的类型不存在（常称 NODATA） | 看 Authority 中的 SOA；换记录类型验证        |
| `NXDOMAIN`             | 查询名称不存在                              | 检查拼写、搜索域、负缓存和权威配置           |
| `SERVFAIL`             | 服务器未能完成解析                          | 常见于 DNSSEC 验证失败、上游超时或权威故障   |
| `REFUSED`              | 服务器按策略拒绝查询                        | 检查 ACL、是否允许递归/区域传送              |
| 超时                   | 没收到可用响应，不是 DNS RCODE              | 检查网络、53 端口、VPN、防火墙和服务器可达性 |

## 传输：UDP、TCP、DoT 与 DoH

- 传统 DNS 的 UDP 和 TCP 都通常使用 53 端口；通用 DNS 实现需要支持两者
- UDP 没有连接建立开销，适合多数短查询
- EDNS(0) 允许双方声明更大的 UDP 载荷和扩展能力，但过大的 UDP 包可能分片或被网络设备丢弃
- 响应放不进可用 UDP 大小时，服务器设置 `TC=1`，客户端通常通过 TCP 重试
- 区域传送 AXFR/IXFR 通常使用 TCP，但 TCP 并不只服务于区域传送
- DoT（DNS over TLS）用 TLS 保护 DNS 传输，默认 TCP 853
- DoH（DNS over HTTPS）把 DNS 查询放进 HTTPS，通常使用 443

DoT/DoH 主要保护**客户端到所选递归解析器**这一段，防止沿途直接看到或篡改 DNS 内容；递归解析器本身仍然能看到查询

## DNSSEC

DNSSEC 主要解决：

- **来源认证**：响应数据属于正确的已签名区域
- **完整性**：RRset 在发布后没有被篡改
- **可验证的不存在**：可通过 NSEC/NSEC3 证明某名称或类型不存在

核心记录：

- `RRSIG`：某个 RRset 的数字签名
- `DNSKEY`：区域公开的验证公钥。常按用途区分 ZSK（签普通 RRset）与 KSK（签 DNSKEY RRset），但这是一种常见运维模型，不是信任链中两个不同算法
- `DS`：位于父区域，保存子区域某个 DNSKEY（通常是 KSK）的摘要，用于把父区域的信任延伸到子区域

简化后的验证链：

```plain
本地信任锚（根 DNSKEY）
  -> 验证根区域中的 com DS
  -> 验证 com 的 DNSKEY
  -> 验证 com 区域中的 example.com DS
  -> 验证 example.com 的 DNSKEY
  -> 验证 www.example.com A RRset 的 RRSIG
```

父区域签的是父区域中的 **DS RRset**；DS 再与子区域 DNSKEY 对应。任何一环配置错误都可能让验证解析器返回 `SERVFAIL`，即使不验证的查询看起来仍能得到数据

DNSSEC 不提供保密性，也不隐藏查询名称。DoT/DoH 与 DNSSEC 可以组合使用：前者保护到递归解析器的传输，后者验证从 DNS 信任链得到的数据

## DNS 安全与策略解析

传统 UDP/TCP 53 上的 DNS 通常是明文。攻击者若能观察或介入网络，可能伪造响应；递归解析器若接受并缓存错误数据，还可能形成缓存投毒。事务 ID、源端口随机化等能提高伪造难度，但不等于加密或来源认证

安全 DNS 服务也可能主动执行策略：发现恶意域名后返回拦截页 IP、`NXDOMAIN` 或其他策略结果。这种 **policy-implementing resolver** 是解析器有意修改答案，与攻击者伪造响应的安全事件不是一回事。企业内网和恶意域名防护都可能使用这种方式

`/etc/hosts` 只能对单机、少量固定地址做临时覆盖：它不会验证 DNS，难以维护 CDN 的动态地址，也会绕过基于 DNS 的故障切换，因此不应当作通用的 DNS 安全方案

## CDN 与 DNS

CDN（Content Delivery Network，内容分发网络）在多个地点部署边缘节点，让用户先连接合适的边缘节点，而不是每次都直接访问源站。边缘节点可以缓存静态内容，也可以作为反向代理把未命中的请求转发到源站。DNS 主要负责把用户引导到 CDN，真正的缓存、回源和内容传输发生在 HTTP/TLS 层

### 接入与请求链路

以 `static.example.com` 接入 CDN 为例：

```plain
static.example.com
  -> CNAME cdn-provider.example
  -> CDN 根据位置、健康状态和容量返回边缘节点 IP
  -> 客户端与边缘节点建立 TCP/QUIC、TLS 和 HTTP 连接
  -> 缓存命中：边缘节点直接响应
  -> 缓存未命中：边缘节点访问源站，取得响应后按策略缓存并返回
```

虽然连接最终建立到 CDN 的 IP，URL 和 HTTP `Host` 仍然是 `static.example.com`，TLS 证书也必须覆盖这个名称。CDN 根据域名找到对应站点配置；同一个边缘 IP 可以承载许多域名，不能只根据 IP 判断请求属于哪个站点

普通子域名通常通过 CNAME 接入。区域顶点（例如以 `example.com` 为区域时的 `example.com`）必须同时存在 SOA、NS 等记录，而 CNAME owner 通常不能再拥有其他普通数据，因此不能直接配置标准 CNAME。托管商提供的 `ALIAS`、`ANAME` 或 CNAME flattening 会在服务端解析 CDN 目标并对外合成 A/AAAA 答案，它们是服务商能力，不是普通 CNAME 记录类型

### 边缘缓存与回源

边缘节点通常使用 URL，以及配置指定的查询参数、请求头或 Cookie 组成缓存键。缓存键不同会生成不同副本；忽略了会改变响应内容的字段，则可能把一个用户或一种内容的响应错误地提供给其他请求。因此带有身份信息或个性化内容的响应默认不应共享缓存，除非已经明确设计缓存键和缓存策略

源站可以通过 `Cache-Control`、`Expires`、`ETag` 等 HTTP 响应头影响缓存行为，CDN 也可能按自己的规则覆盖它们。常见处理包括：

- **命中**：缓存副本仍然有效，边缘节点直接返回
- **重新验证**：副本过期后，边缘节点携带 `If-None-Match` 或 `If-Modified-Since` 向源站确认；源站可返回 `304 Not Modified`
- **回源**：没有可用副本，边缘节点从源站取得完整响应
- **刷新或失效**：主动清除旧副本；大规模刷新不一定瞬时完成，带内容哈希的资源名通常更适合长期缓存

DNS TTL 和 HTTP 缓存时间解决的是不同问题：

| 配置                    | 控制对象                      | 过期后的行为                         |
| ----------------------- | ----------------------------- | ------------------------------------ |
| DNS 记录的 TTL          | 域名解析结果，例如边缘节点 IP | 解析器重新查询 DNS                   |
| HTTP `Cache-Control` 等 | 浏览器或 CDN 中的响应内容副本 | 重新验证、回源或重新下载，取决于策略 |

动态请求也可以经过 CDN，以复用连接、终止 TLS、执行访问控制或选择更优的回源路径，但通常不会像公共静态资源一样直接共享缓存。使用 CDN 也不意味着源站可以忽略容量与安全：缓存未命中、缓存穿透或集中刷新仍可能产生大量回源请求

## DNS 排障

### DNS 查询工具 `dig`

```bash
dig example.com A

# 只打印记录值，适合脚本或快速查看
dig +short example.com A

# 保留 Answer 的完整字段，能同时看到 TTL
dig +noall +answer example.com A

# 同时观察转介与附加信息
dig +noall +answer +authority +additional example.com A

# 询问指定递归解析器
dig @1.1.1.1 example.com A

# 获得 NS 列表后，直接询问其中一台权威服务器
dig example.com NS
dig @a.iana-servers.net example.com A

# dig -x 执行 DNS 反向解析

dig -x 192.0.2.10

# +trace 沿委派链迭代

dig +trace www.example.com A

# 强制使用 TCP 53
dig +tcp example.com A

# 请求 DNSSEC 相关记录
dig +dnssec example.com A

# 不要求被询问服务器递归，适合测试其缓存或权威能力
dig +norecurse @1.1.1.1 example.com A

# 显式查看 DNSSEC 记录
dig example.com DNSKEY
dig example.com DS
```

> - `dig -x` 会把 IP 转为相应的反向区域名称并查询 PTR。PTR 是独立配置，不保证存在，也不保证反向结果再正向解析时回到原 IP
> - `+dnssec` 主要设置 EDNS 的 DO 位，请服务器返回 DNSSEC 数据。是否真正验证成功，还取决于本地工具或递归解析器是否执行验证；递归响应中的 `ad` 表示解析器声称数据已通过验证

### macOS：查看系统实际配置

```bash
# macOS 的完整解析器配置，包括 VPN/按域 resolver
scutil --dns

# 通过系统目录服务查询主机，更接近普通应用使用的系统解析路径
dscacheutil -q host -a name example.com

# 查看 /etc/resolv.conf；它不一定完整反映 macOS 的按域解析规则
cat /etc/resolv.conf
```

`scutil --dns` 中可能同时出现多个 resolver。`domain`、`search domain`、`nameserver`、`if_index` 和顺序共同决定某类名称走哪个网络接口或 DNS 服务器

### Linux：查看 systemd-resolved 配置

```bash
resolvectl status
resolvectl query example.com
cat /etc/resolv.conf
```

`/etc/resolv.conf` 可能只指向本机 stub（例如环回地址），真正的上游服务器要从 `resolvectl status` 或实际使用的网络管理工具中确认

### 绕过 DNS 测试 HTTP/TLS

```bash
curl --resolve example.com:443:192.0.2.10 https://example.com/
```

`--resolve` 只为这次 `curl` 指定“域名:端口 -> IP”，同时仍使用 URL 中的域名发送 HTTP Host 并校验 TLS 证书

### 刷新本机缓存

先对比系统解析、指定递归解析器和权威服务器的结果，确认旧数据确实只留在本机。macOS 必须刷新时可以使用：

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

这不会清除上游递归解析器或浏览器自己的所有缓存，也无法让权威修改“更快传播”。Linux 的刷新方式取决于实际缓存服务；使用 systemd-resolved 时可运行 `sudo resolvectl flush-caches`
