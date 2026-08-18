# Linux

## 系统信息

```bash
uname -a                  # 查看内核、主机名和 CPU 架构等信息
cat /etc/os-release       # 查看 Linux 发行版信息
hostnamectl               # 查看主机名、操作系统和内核信息
lscpu                     # 查看 CPU 架构、核心数和线程数
uptime                    # 查看运行时长和系统平均负载
date                      # 查看当前日期和时间
whoami                    # 查看当前用户名
id                        # 查看当前用户的 UID、GID 和所属用户组
who                       # 查看当前登录的用户
history                   # 查看当前 Shell 的历史命令
```

## Linux 目录结构

| 目录             | 主要用途                                                                    |
| ---------------- | --------------------------------------------------------------------------- |
| `/`              | 根目录，整个文件系统目录树的起点                                            |
| `/bin`           | 启动和基本维护所需的常用命令，如 `ls`、`cp`、`cat`                          |
| `/sbin`          | 系统管理命令，如 `fsck`、`mkfs`                                             |
| `/boot`          | 内核、initramfs 和引导加载器等启动文件                                      |
| `/dev`           | 磁盘、终端等设备对应的设备文件                                              |
| `/etc`           | 系统级配置文件                                                              |
| `/home`          | 普通用户的主目录，例如 `/home/rico`                                         |
| `/root`          | `root` 用户的主目录                                                         |
| `/lib`、`/lib64` | 基本命令所需的共享库和内核模块                                              |
| `/proc`          | 由内核提供的虚拟文件系统，包含进程和内核运行信息，例如 `/proc/<pid>`        |
| `/sys`           | 由内核提供的虚拟文件系统，用于展示和配置设备、驱动及内核对象                |
| `/run`           | 本次启动后的运行时数据，如 PID 文件和 Unix Socket，重启后会清空             |
| `/tmp`           | 临时文件，系统可能定期或在重启时清理，不应存放需要长期保留的数据            |
| `/usr`           | 大部分用户空间程序、库和共享资源，如 `/usr/bin`、`/usr/lib`、`/usr/share`   |
| `/usr/local`     | 管理员手动安装、且不由发行版软件包管理器维护的软件                          |
| `/var`           | 经常变化的数据，如 `/var/log` 日志、`/var/cache` 缓存和 `/var/lib` 应用数据 |
| `/opt`           | 可选或第三方应用程序                                                        |
| `/mnt`           | 临时手动挂载文件系统                                                        |
| `/media`         | U 盘、光盘等可移动设备的挂载点                                              |

> 现代发行版可能采用合并的 `/usr` 目录结构，使 `/bin`、`/sbin`、`/lib` 成为 `/usr` 中对应目录的符号链接。可以使用 `man hier` 查看当前系统的目录层次说明

## 文件与目录

### 查看与切换目录

```bash
pwd                       # 查看当前目录的绝对路径
ls                        # 列出当前目录内容
ls -lah                   # 显示隐藏文件、权限和易读的文件大小
ls -lt                    # 按修改时间倒序排列
cd <directory>            # 切换目录
cd ..                     # 切换到上一级目录
cd -                      # 切换到上一次所在目录
```

`ls` 常用参数：

- `-a`：显示以 `.` 开头的隐藏文件
- `-l`：显示权限、所有者、大小和修改时间等详细信息
- `-h`：配合 `-l`，使用 KiB、MiB、GiB 等易读单位显示文件大小
- `-t`：按修改时间排序，最近修改的内容在前

### 创建、复制与移动

```bash
touch <file>                       # 创建空文件或更新文件时间戳
mkdir <directory>                  # 创建目录
mkdir -p <parent>/<child>          # 递归创建多级目录
cp <source> <target>               # 复制文件
cp -r <source_dir> <target_dir>    # 递归复制目录
cp -i <source> <target>            # 覆盖已有文件前询问
mv <source> <target>               # 移动文件或重命名
mv -i <source> <target>            # 覆盖已有文件前询问
rm <file>                          # 删除文件
rm -r <directory>                  # 递归删除目录
rm -i <file>                       # 删除文件前询问
```

`cp`、`mv` 和 `rm` 常用参数：`-r` 递归处理目录，`-i` 操作前询问，`-f` 强制执行且不询问

### 链接

```bash
ln <target> <link>          # 创建硬链接
ln -s <target> <link>       # 创建符号链接（软链接）
ln -sfn <target> <link>     # 强制更新已有的符号链接
readlink <link>             # 查看符号链接中保存的目标路径
readlink -f <path>          # 解析路径中的符号链接，输出规范化绝对路径
ls -li <path>               # 查看 inode 编号和链接数
```

| 类型     | 本质                        | 目标删除后的结果           | 限制                         |
| -------- | --------------------------- | -------------------------- | ---------------------------- |
| 硬链接   | 同一个 inode 的另一个文件名 | 数据仍可通过其他硬链接访问 | 通常不能链接目录或跨文件系统 |
| 符号链接 | 保存目标路径的独立文件      | 链接失效，成为悬空链接     | 可以链接目录和跨文件系统     |

相对符号链接中的目标路径，是相对于**链接所在目录**解析的，而不是相对于执行 `ln` 时的工作目录。删除符号链接本身不会删除目标文件

### 查看文件内容

```bash
cat <file>                 # 输出完整文件内容，适合小文件
less <file>                # 分页查看文件，按 q 退出
less -N <file>             # 分页查看并显示行号
head -n 20 <file>          # 查看文件前 20 行
tail -n 20 <file>          # 查看文件后 20 行
tail -f <file>             # 持续输出文件新增内容，常用于查看日志
wc -l <file>               # 统计文件行数
file <file>                # 判断文件类型
stat <file>                # 查看文件大小、权限和时间戳等详细信息
```

## 查找与文本处理

### 查找文件

```bash
find <path> -name "*.log"                 # 按名称查找文件
find <path> -iname "*.log"                # 按名称查找并忽略大小写
find <path> -maxdepth 2 -type d           # 查找两层以内的目录
find <path> -type f -size +100M           # 查找大于 100 MiB 的文件
find <path> -type f -mtime -7             # 查找 7 天内修改过的文件
find <path> -type f -newer <file>         # 查找修改时间晚于指定文件的文件
find <path> -type f -exec stat {} +       # 批量把查找结果传给 stat
find <path> -type f -ok rm {} \;          # 对每个结果询问后再执行 rm
```

`find` 中，`-type f` 表示普通文件，`-type d` 表示目录；`-mtime -7` 表示不到 7 天，`+7` 表示超过 7 天

`{}` 是文件占位符，`+` 表示批量处理，`;` 表示逐个处理。`-exec command {} +` 会把多个结果组成一批调用命令，通常比逐个执行的 `{} \;` 更高效。`-ok` 与 `-exec` 类似，但每次执行前会询问。路径可能包含空格或换行符，不应使用 `find ... | xargs command` 的简单写法处理任意文件名；可以使用 `-exec ... {} +`，或使用 `-print0`（每个文件后输出一个空字符）配合 `xargs -0`（按照空字符分隔），如：

```bash
find <path> -type f -print0 | xargs -0 stat
```

### 搜索和处理文本

```bash
grep "text" <file>                       # 在文件中搜索文本
grep -Rni "text" <directory>             # 递归搜索，并显示行号且忽略大小写
grep -v "text" <file>                    # 输出不匹配的行
grep -E "error|warning" <file>           # 使用扩展正则表达式
sort <file>                              # 按行排序
sort <file> | uniq                       # 排序后去除相邻的重复行
sort <file> | uniq -c                    # 排序并统计每行出现次数
cut -d: -f1 /etc/passwd                  # 使用 : 分隔并提取第 1 列（-d delimiter -f field）
sed 's/old/new/g' <file>                 # 替换文本并输出，不修改原文件（s substitute g global）
awk '{print $1}' <file>                  # 按空白字符分列并输出第 1 列
```

`grep` 常用参数：`-R` 递归搜索，`-n` 显示行号，`-i` 忽略大小写，`-v` 反向匹配，`-E` 启用扩展正则表达式

安装 [ripgrep](https://github.com/BurntSushi/ripgrep)，可以使用 `rg` 更快地递归搜索文本：

```bash
rg "text" <directory>                    # 递归搜索文本
rg --files <directory>                   # 列出会被搜索的文件
```

### 比较文件

```bash
diff <old_file> <new_file>               # 按行比较两个文件
diff -u <old_file> <new_file>            # 使用统一格式输出差异
diff -ru <old_dir> <new_dir>             # 递归比较两个目录
cmp <file_a> <file_b>                    # 按字节比较，适合快速判断是否相同
patch --dry-run -p1 < change.patch       # 预演补丁，不修改文件
patch -p1 < change.patch                 # 应用补丁，去掉路径最前面的 1 层
```

`diff` 返回 `0` 表示没有差异，`1` 表示存在差异，大于 `1` 表示执行出错。应用来源不明的补丁前，应先检查内容并使用 `patch --dry-run` 预演

## 权限与用户

`ls -l` 输出中的权限由文件类型以及所有者（user）、所属组（group）、其他用户（others）的读 `r`、写 `w`、执行 `x` 权限组成

同一个权限位对普通文件和目录的含义不同：

| 权限 | 普通文件                 | 目录                                     |
| ---- | ------------------------ | ---------------------------------------- |
| `r`  | 读取文件内容             | 列出目录项名称                           |
| `w`  | 修改或截断文件内容       | 创建、删除或重命名目录项，通常还需要 `x` |
| `x`  | 将文件作为程序或脚本执行 | 进入目录，并通过已知名称访问其中的文件   |

删除文件主要取决于其父目录的 `w + x` 权限，而不是文件自身是否可写。像 `/tmp` 这样的共享目录通常设置 sticky bit，使用户只能删除自己拥有的目录项

```bash
ls -l <file>                                   # 查看权限和所有者
chmod u+x <file>                               # 为所有者添加执行权限
chmod 644 <file>                               # 所有者可读写，其他用户只读
chmod 755 <directory>                          # 所有者可读写执行，其他用户可读和执行
chmod -R 755 <directory>                       # 递归修改目录及其内容的权限
find <directory> -type d -exec chmod 755 {} +  # 递归设置目录权限
find <directory> -type f -exec chmod 644 {} +  # 递归设置普通文件权限
chown <user>:<group> <file>                    # 修改所有者和所属组
chown -R <user>:<group> <path>                 # 递归修改所有者和所属组
sudo <command>                                 # 以管理员权限执行单个命令
umask                                          # 以八进制显示当前文件创建掩码
umask -S                                       # 以 u、g、o 符号形式显示允许保留的权限
umask -p                                       # 以可以再次执行的命令格式显示当前掩码
umask 022                                      # 设置掩码：新目录通常为 755，新文件通常为 644
umask u=rwx,g=rx,o=rx                          # 使用符号形式设置，等价于 umask 022
```

> 数字权限中，读 `r = 4`、写 `w = 2`、执行 `x = 1`，每一位是对应权限之和。例如 `7 = rwx`，`6 = rw-`，`5 = r-x`

`umask` 决定创建文件或目录时需要屏蔽哪些权限：

```text
实际初始权限 = 程序请求的权限 & ~umask
```

程序创建普通文件时通常请求 `666`，创建目录时通常请求 `777`。因此相同的 `umask 022` 会得到 `644` 的文件和 `755` 的目录；`umask` 只会移除权限，不会自动给普通文件添加执行权限

| umask | 新文件通常权限 | 新目录通常权限 | 常见用途                 |
| ----- | -------------- | -------------- | ------------------------ |
| `022` | `644`          | `755`          | 所有者写入，其他用户只读 |
| `002` | `664`          | `775`          | 同组用户协作写入         |
| `077` | `600`          | `700`          | 仅当前用户访问           |

符号形式中的 `u`、`g`、`o`、`a` 分别表示所有者、所属组、其他用户和全部用户。修改只影响当前 Shell 及之后创建的子进程，也不会改变已有文件的权限

### 用户与组

```bash
id <user>                            # 查看用户的 UID、主组和附加组
getent passwd <user>                 # 通过系统账户数据库查询用户
getent group <group>                 # 通过系统账户数据库查询用户组
sudo useradd -m -s /bin/bash <user>  # 创建用户、主目录并设置登录 Shell
sudo passwd <user>                   # 交互式设置用户密码
sudo usermod -aG <group> <user>      # 将用户追加到附加组
sudo groupadd <group>                # 创建用户组
sudo userdel <user>                  # 删除账户，默认保留主目录
sudo userdel -r <user>               # 删除账户及其主目录和邮件目录
su - <user>                          # 以目标用户的登录环境启动 Shell
sudo -u <user> <command>             # 以指定用户身份执行单个命令
```

`usermod -aG` 中，`-G` 设置附加组列表，`-a` 表示追加。`/etc/passwd` 保存账户基本信息，`/etc/shadow` 保存受限访问的口令散列和密码期限，`/etc/group` 保存组信息；查询时优先使用 `getent`，因为账户也可能来自 LDAP 等外部数据源

## 进程与资源

```bash
ps aux                         # 查看所有进程的详细信息
ps -ef                         # 以完整格式查看所有进程
top                            # 动态查看进程和系统资源
pgrep -af <name>               # 按名称查找进程，并显示完整命令行
kill <pid>                     # 向进程发送 SIGTERM，请求正常退出
kill -9 <pid>                  # 发送 SIGKILL，强制终止进程
kill -l                        # 查看当前系统支持的信号
jobs                           # 查看当前 Shell 启动的后台任务
command &                      # 在后台启动命令
fg %1                          # 将编号为 1 的任务切换到前台
```

`ps aux` 中，`a` 表示其他用户的进程，`u` 使用面向用户的详细格式，`x` 包含没有控制终端的进程

## 磁盘与内存

```bash
df -h                          # 查看各文件系统的磁盘使用情况
df -i                          # 查看 inode 使用情况
du -sh <path>                  # 查看文件或目录占用的总空间
du -ah <path>                  # 递归查看所有文件和目录占用的空间
du -h --max-depth=1 <path>     # 查看一级子目录占用的空间
free -h                        # 查看内存和 Swap 使用情况
lsblk -f                       # 查看块设备、文件系统和挂载关系
mount                          # 查看已挂载的文件系统
findmnt                        # 以树状结构查看挂载关系
```

`df` 查看文件系统整体空间，`du` 统计具体路径实际占用的空间。常用参数 `-h` 表示易读单位，`-s` 表示只输出总计，`-a` 表示包含文件

### 挂载文件系统

```bash
lsblk -f                                # 查看设备、文件系统类型、UUID 和挂载点
sudo mount <device> <mountpoint>        # 将文件系统挂载到目录
sudo mount -o ro <device> <mountpoint>  # 以只读方式挂载
sudo umount <mountpoint>                # 按挂载点卸载
findmnt --target <path>                 # 查找包含指定路径的文件系统
findmnt --verify                        # 检查 /etc/fstab 的可解析性和可用性
sudo mount -a                           # 挂载 /etc/fstab 中尚未挂载的条目
```

挂载点应当是已存在的目录。卸载前要确保没有进程正在使用该文件系统，可以使用 `fuser -vm <mountpoint>` 或 `lsof +f -- <mountpoint>` 排查

`/etc/fstab` 用于声明持久挂载规则，每条记录包含 6 个字段：

```text
<source> <mountpoint> <filesystem> <options> <dump> <fsck_order>
UUID=<uuid> /data ext4 defaults,nofail 0 2
```

- `source`：建议使用 `UUID=<uuid>` 或 `LABEL=<label>`，避免设备名变化导致挂载错误
- `options`：逗号分隔的挂载选项；`defaults` 是常用默认集合，`ro` 表示只读，`nofail` 表示设备缺失时不阻止启动
- `dump`：通常为 `0`，表示不使用传统 `dump` 备份
- `fsck_order`：`0` 表示启动时不检查，根文件系统通常为 `1`，其他需要检查的文件系统通常为 `2`

::: warning 修改 fstab 前验证
错误的 `/etc/fstab` 可能导致系统启动或挂载失败。编辑后先运行 `findmnt --verify`，再用 `mount -a` 测试；操作前应备份原文件，并保留一个具备管理员权限的终端会话
:::

## 网络

```bash
ip addr                        # 查看网络接口和 IP 地址
ip route                       # 查看路由表
ping -c 4 <host>               # 发送 4 次 ICMP 请求测试连通性
curl -I <url>                  # 只请求并查看 HTTP 响应头
curl -L -o <file> <url>        # 跟随重定向，并下载到指定文件
wget <url>                     # 下载文件
ss -lntp                       # 查看监听中的 TCP 端口及对应进程
dig <domain>                   # 查询 DNS 记录
traceroute <host>              # 查看数据包到目标主机的大致路径
nmcli device status            # 查看 NetworkManager 管理的网络设备状态
nmcli connection show          # 查看 NetworkManager 连接配置
```

`curl` 常用参数：`-I` 只获取响应头，`-L` 跟随重定向，`-o` 指定保存文件名，`-O` 使用远程文件名，`-sS` 隐藏进度但保留错误信息

`ss -lntp` 中，`-l` 只显示监听套接字，`-n` 不解析服务名称，`-t` 只显示 TCP，`-p` 显示对应进程

在 Rocky Linux 9、RHEL 9 等现代发行版中，应使用 NetworkManager（例如 `nmcli`）管理持久网络配置。旧式 `ifconfig` 和 `route` 通常由 `ip` 替代，`netstat` 通常由 `ss` 替代；`/etc/sysconfig/network-scripts/ifcfg-*` 格式也已弃用，新配置默认存放在 `/etc/NetworkManager/system-connections/`

### SSH 与远程复制

```bash
ssh <user>@<host>                                   # 登录远程主机
ssh -p <port> <user>@<host>                         # 指定 SSH 服务端口
ssh <user>@<host> '<command>'                       # 在远程主机执行单个命令
ssh-keygen -t ed25519 -C "<comment>"                # 生成 Ed25519 密钥对
ssh-copy-id -i ~/.ssh/id_ed25519.pub <user>@<host>  # 安装公钥到远程账户
scp <file> <user>@<host>:<remote_path>              # 将本地文件复制到远程主机
scp -r <directory> <user>@<host>:<path>             # 递归复制目录
scp -P <port> <file> <user>@<host>:<path>           # 为 scp 指定 SSH 端口
```

首次连接时应通过可信渠道核对服务器主机密钥指纹。私钥应仅由当前用户读取，例如 `chmod 600 ~/.ssh/id_ed25519`。现代 OpenSSH 的 `scp` 默认使用 SFTP 协议传输；需要交互式浏览和批量传输时可以直接使用 `sftp`

## 压缩与归档

```bash
tar -czf archive.tar.gz <path>      # 创建 gzip 压缩归档
tar -xzf archive.tar.gz             # 解压 gzip 归档到当前目录
tar -tzf archive.tar.gz             # 查看归档内容但不解压
tar -xzf archive.tar.gz -C <dir>    # 解压到指定目录
zip -r archive.zip <path>           # 创建 zip 压缩包
unzip archive.zip                   # 解压 zip 压缩包
```

`tar` 常用参数：`c` 创建归档，`x` 解开归档，`t` 查看内容，`z` 使用 gzip，`f` 指定归档文件，`v` 显示处理过程，`-C` 指定操作目录

## 服务与日志

使用 systemd 的 Linux 发行版可以通过 `systemctl` 管理系统服务，通过 `journalctl` 查看日志：

```bash
systemctl status <service>             # 查看服务状态
sudo systemctl start <service>         # 启动服务
sudo systemctl stop <service>          # 停止服务
sudo systemctl restart <service>       # 重启服务
sudo systemctl enable <service>        # 设置服务开机启动
sudo systemctl enable --now <service>  # 设置开机启动，并立即启动服务
journalctl -u <service>                # 查看指定服务的日志
journalctl -u <service> -f             # 持续查看指定服务的新日志
journalctl -u <service> -n 100         # 查看指定服务最近 100 条日志
journalctl --since "1 hour ago"        # 查看最近一小时的日志
journalctl -p err -b                   # 查看本次启动后的错误级别日志
```

`journalctl` 常用参数：`-u` 指定服务单元，`-f` 持续输出，`-n` 限制条数，`-b` 限制为本次系统启动后的日志

## 软件包管理

不同 Linux 发行版使用的软件包管理器不同

::: code-group

```bash [Debian / Ubuntu]
sudo apt update                  # 更新软件包索引
sudo apt upgrade                 # 升级已安装的软件包
sudo apt install <package>       # 安装软件包
sudo apt remove <package>        # 卸载软件包
sudo apt autoremove              # 删除不再需要的依赖
apt search <keyword>             # 搜索软件包
apt show <package>               # 查看软件包信息
```

```bash [Fedora / RHEL]
sudo dnf upgrade                 # 更新软件包
sudo dnf install <package>       # 安装软件包
sudo dnf remove <package>        # 卸载软件包
dnf search <keyword>             # 搜索软件包
dnf info <package>               # 查看软件包信息
```

```bash [Arch Linux]
sudo pacman -Syu                 # 同步索引并升级软件包
sudo pacman -S <package>         # 安装软件包
sudo pacman -R <package>         # 卸载软件包
pacman -Ss <keyword>             # 搜索软件包
pacman -Qi <package>             # 查看已安装软件包的信息
```

:::

## 命令帮助

```bash
man <command>                    # 查看命令手册，按 q 退出
man <section> <name>             # 查看指定章节，例如 man 5 fstab
<command> --help                 # 查看命令的简要帮助
apropos <keyword>                # 按名称和简介搜索 man 手册页
```

常见 man 章节：`1` 是普通用户命令，`2` 是系统调用，`3` 是库函数，`5` 是文件格式和配置文件，`7` 是概念及约定，`8` 是系统管理命令。同一个名称可能出现在多个章节，例如 `man 1 passwd` 查看命令，`man 5 passwd` 查看 `/etc/passwd` 文件格式
