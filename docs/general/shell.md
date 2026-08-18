# Shell

本文默认使用 Bash。`[[ ... ]]`、数组、`local` 和进程替换等语法不是通用的 POSIX `sh` 语法；脚本如果需要由 `/bin/sh` 执行，应避免这些 Bash 扩展

## 脚本结构与执行

```bash
#!/usr/bin/env bash

set -o nounset
set -o pipefail

main() {
  printf 'hello, %s\n' "${USER:-unknown}"
}

main "$@"
```

- `#!/usr/bin/env bash`：执行 `./script.sh` 时，从 `PATH` 中查找 Bash；如果环境要求固定解释器，也可以使用明确路径，例如 `#!/bin/bash`
- `set -o nounset`：引用未定义变量时返回错误，简写为 `set -u`
- `set -o pipefail`：管道中任一命令失败时，使整个管道返回非零状态
- `main "$@"`：把脚本参数按原有边界传给入口函数

```bash
bash script.sh                 # 显式使用 Bash 执行，不要求脚本有执行权限
chmod +x script.sh
./script.sh                    # 按 shebang 选择解释器
bash -n script.sh              # 只检查语法，不执行脚本
```

`set -e` 会在部分命令返回非零状态时退出，但它在条件、逻辑列表、管道和子 Shell 中存在较多例外，不能代替明确的错误处理。对关键操作，优先直接检查退出状态

## 输出、重定向与管道

### `echo` 与 `printf`

`echo` 适合交互式输出和简单提示：

```bash
echo "hello, Linux"                # 输出文本并在末尾换行
echo -n "loading..."               # 输出后不换行
echo "$PATH"                       # 展开并输出变量
echo 'home: $HOME'                 # 单引号内不展开变量
```

不同 Shell 对 `echo` 参数和反斜杠的处理可能不同。需要精确控制格式时，优先使用 `printf`：

```bash
printf 'name: %s\nage: %d\n' "Rico" 25
```

### 重定向

```bash
command > <file>               # 标准输出写入文件，并覆盖原内容
command >> <file>              # 标准输出追加到文件末尾
command 2> <file>              # 标准错误写入文件
command > <file> 2>&1          # 标准输出和标准错误写入同一文件
command < <file>               # 从文件读取标准输入
command | tee <file>           # 同时输出到终端和文件，并覆盖原内容
command | tee -a <file>        # 同时输出到终端和文件，并追加内容
```

重定向从左到右处理。`command > <file> 2>&1` 先把标准输出指向文件，再让标准错误指向标准输出当前的目标

### 管道与逻辑列表

```bash
command_a | command_b          # 把前一条命令的标准输出传给后一条命令
mkdir build && cd build        # 前一条命令成功时继续
test -f <file> || echo "file does not exist" # 前一条命令失败时执行备用命令
```

默认情况下，管道中的各个命令在子 Shell 中执行，子 Shell 对变量和当前目录的修改不能影响外部 Shell。管道的退出状态默认取最后一条命令；启用 `set -o pipefail` 后，任一命令失败都会让管道返回非零状态

`command1 && command2` 只在前一条命令成功时执行第二条；`command1 || command2` 只在前一条命令失败时执行第二条

## 变量、引用与展开

### 变量定义与引用

变量名通常由字母、数字和下划线组成，不能以数字开头。赋值符号 `=` 两侧不能有空格：

```bash
name="Rico"                       # 定义变量
printf '%s\n' "$name"            # 引用变量
printf '%s\n' "${name}_backup"   # 使用 {} 明确变量名边界
readonly app_name="kb"            # 定义只读变量
unset name                        # 删除变量
```

除非确实需要单词分割或通配符展开，变量和命令替换通常都应放在双引号中：

| 写法         | 行为                                                |
| ------------ | --------------------------------------------------- |
| `$value`     | 展开后还会执行单词分割和通配符展开                  |
| `"$value"`   | 展开变量，并把结果保留为一个参数                    |
| `'${value}'` | 不展开变量，得到字面量 `${value}`                   |
| `\$value`    | 转义 `$`，得到字面量 `$value`                       |
| `${value}1`  | 使用 `{}` 明确变量名边界，避免被解析为变量 `value1` |

### 通配符与花括号扩展

通配符（glob）由 Shell 在命令执行前展开，命令实际接收到的是匹配后的路径列表：

| 模式          | 含义                         | 示例                         |
| ------------- | ---------------------------- | ---------------------------- |
| `*`           | 匹配任意数量的任意字符       | `*.log` 匹配所有 `.log` 文件 |
| `?`           | 匹配一个任意字符             | `file?.txt` 匹配 `file1.txt` |
| `[abc]`       | 匹配集合中的一个字符         | `file[abc].txt`              |
| `[0-9]`       | 匹配指定范围中的一个字符     | `file[0-9].txt`              |
| `[!0-9]`      | 匹配不在指定范围中的一个字符 | `file[!0-9].txt`             |
| `[[:digit:]]` | 匹配一个数字字符             | `file[[:digit:]].txt`        |
| `[[:alpha:]]` | 匹配一个字母字符             | `[[:alpha:]]*.txt`           |

```bash
ls *.log                         # 查看当前目录下所有 .log 文件
ls file?.txt                     # ? 位置只匹配一个字符
cp image[0-9].png <directory>    # 复制 image0.png 到 image9.png
```

通配符默认不匹配以 `.` 开头的隐藏文件。操作前可以先用 `printf '%s\n' *.log` 或 `ls` 查看展开结果，再执行复制、移动或删除

Bash 的 `**` 可以递归匹配任意层级的目录，但需要先启用 `globstar`：

```bash
shopt -s globstar
ls **/*.log
```

花括号扩展不检查文件是否存在，而是直接生成字符串：

```bash
printf '%s\n' file.{jpg,png}     # 生成 file.jpg 和 file.png
printf '%s\n' {1..3}             # 生成 1、2、3
```

通配符和正则表达式的语法不同。需要把模式原样传给 `find` 等命令时，应使用引号阻止 Shell 提前展开：

```bash
find <path> -name "*.log"
```

### 命令替换

`$(command)` 把命令的标准输出作为值使用，并移除末尾连续的换行符：

```bash
current_date=$(date +%F)
file_count=$(find . -type f | wc -l)
printf '%s: %s files\n' "$current_date" "$file_count"
```

### 参数默认值

| 展开形式          | 结果                                                 |
| ----------------- | ---------------------------------------------------- |
| `${var:-word}`    | `var` 未设置或为空时使用 `word`，不修改 `var`        |
| `${var:=word}`    | `var` 未设置或为空时把 `word` 赋给 `var`，再展开新值 |
| `${var:?message}` | `var` 未设置或为空时报错；非交互 Shell 随后退出      |
| `${var:+word}`    | `var` 已设置且非空时使用 `word`，否则展开为空        |

带冒号的形式同时检查“未设置”和“空字符串”；去掉冒号，例如 `${var-word}`，只检查变量是否未设置

### 字符串处理

```bash
path="archive.tar.gz"

printf '%s\n' "${#path}"      # 字符串长度
printf '%s\n' "${path:8:3}"   # 从下标 8 开始取 3 个字符：tar
printf '%s\n' "${path#*.}"    # 从开头删除最短匹配：tar.gz
printf '%s\n' "${path##*.}"   # 从开头删除最长匹配：gz
printf '%s\n' "${path%.*}"    # 从末尾删除最短匹配：archive.tar
printf '%s\n' "${path%%.*}"   # 从末尾删除最长匹配：archive
printf '%s\n' "${path//./_}"  # 替换所有匹配：archive_tar_gz
```

### 算术运算

```bash
count=2
next=$((count + 1))            # 展开计算结果
((count += 1))                 # 直接修改变量

if ((count > 2)); then
  printf 'count=%d\n' "$count"
fi
```

Bash 算术运算只处理整数。`((expression))` 的计算结果非零时退出状态为 `0`，结果为零时退出状态为 `1`；因此 `((count++))` 在 `count` 原值为 `0` 时会返回失败状态

## 环境变量与启动文件

普通 Shell 变量由当前 Shell 管理，外部命令默认无法读取。使用 `export` 后，当前 Shell 随后启动的子进程才能通过环境读取它：

```bash
project="kb"                       # 当前 Shell 变量
export project                     # 导出为环境变量
export NODE_ENV="production"       # 定义并导出环境变量
NODE_ENV="test" pnpm test          # 只为本次命令临时设置环境变量
printenv NODE_ENV                  # 查看指定环境变量
env                                # 查看全部环境变量
```

子进程获得的是环境变量副本，因此子进程的修改不会反向改变父 Shell。常见环境变量包括：

| 变量    | 含义                                  |
| ------- | ------------------------------------- |
| `PATH`  | 查找可执行命令的目录列表，以 `:` 分隔 |
| `HOME`  | 当前用户的主目录                      |
| `USER`  | 当前用户名                            |
| `SHELL` | 用户配置的默认 Shell 路径             |
| `PWD`   | 当前工作目录                          |
| `LANG`  | 语言、字符编码以及日期等区域格式      |

### Bash 启动文件

Bash 根据是否为登录 Shell、是否交互来读取不同的启动文件：

| Shell 类型         | 常见读取顺序                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| 交互式登录 Shell   | `/etc/profile`，然后依次查找 `~/.bash_profile`、`~/.bash_login`、`~/.profile`，只读取首个可用文件 |
| 交互式非登录 Shell | `~/.bashrc`；部分发行版还会通过系统级配置加载 `/etc/bashrc` 或 `/etc/bash.bashrc`                 |
| 非交互脚本         | 默认不读取上述交互配置；设置了 `BASH_ENV` 时读取它指向的文件                                      |

```bash
source ~/.bashrc                    # 在当前 Shell 中重新读取配置
. ~/.bashrc                         # source 的 POSIX 简写
```

> 文件名和系统级 Bash 配置路径存在发行版差异。通常把 alias、函数和交互提示符放在 `~/.bashrc`，把只需登录时执行的环境初始化放在登录配置中；不要在启动文件中无条件输出文字，否则可能干扰脚本和远程命令

## 命令解析与 alias

```bash
type <command>                      # 判断名称是别名、内建命令、函数还是可执行文件
type -a <command>                   # 列出同名命令的所有解析结果
command -V <command>                # 显示 Shell 将如何解释命令名
help <builtin>                      # 查看 Bash 内建命令帮助
alias                               # 查看全部别名
alias ll='ls -lah'                  # 定义当前 Shell 会话中的别名
unalias ll                          # 删除别名
command ls                          # 跳过同名函数，按命令搜索规则执行 ls
\ls                                 # 跳过同名 alias，再继续查找命令
```

Shell 解析简单命令名时，会涉及 alias、函数、内建命令以及 `PATH` 中的可执行文件。`which` 主要搜索 `PATH`，不能可靠反映所有 Shell 内建命令、函数和 alias，因此判断实际执行对象时优先使用 `type -a`

alias 适合缩短交互式命令，不接收位置参数。需要参数、条件或多步逻辑时，应定义 Shell 函数：

```bash
mkcd() {
  mkdir -p -- "$1" && cd -- "$1"
}
```

## 位置参数与特殊参数

```bash
printf '脚本名：%s\n' "$0"
printf '参数个数：%d\n' "$#"
printf '第一个参数：%s\n' "${1:-}"
printf '第十个参数：%s\n' "${10:-}"

for arg in "$@"; do
  printf '<%s>\n' "$arg"
done
```

- `$0`：脚本名或当前 Shell 名称
- `$1` 至 `$9`：前 9 个位置参数；两位及以上必须写为 `${10}`、`${11}` 等
- `$#`：位置参数数量
- `"$@"`：把每个位置参数保留为独立参数，转发参数时优先使用
- `"$*"`：把全部位置参数合并为一个字符串，分隔符取 `IFS` 的第一个字符
- `$?`：上一条命令的退出状态
- `$$`：当前 Shell 的进程 ID
- `shift [n]`：移除前 `n` 个位置参数，默认移除 1 个

读取可选位置参数时，可以使用 `${1:-}` 避免 `set -u` 因参数缺失而退出。需要强制参数存在时，可使用 `${1:?usage: $0 <file>}`

## 函数

```bash
log() {
  local level=$1
  shift
  printf '[%s] %s\n' "$level" "$*" >&2
}

is_readable_file() {
  local file=$1
  [[ -f $file && -r $file ]]
}

log INFO "start"
if is_readable_file "app.conf"; then
  printf 'config found\n'
fi
```

函数调用时的位置参数会临时替换当前的 `$1`、`$2`、`$#` 和 `$@`。函数内应使用 `local` 避免意外修改同名外部变量

`return [n]` 返回的是 `0` 至 `255` 的退出状态，不适合返回字符串或复杂数据。需要返回文本时，让函数写入标准输出，再通过命令替换接收：

```bash
current_branch() {
  git branch --show-current
}

branch=$(current_branch)
```

## 条件与退出状态

Shell 直接以命令的退出状态判断真假：`0` 表示成功，非 `0` 表示失败。通常可以直接把命令放进 `if`，不必先读取 `$?`

```bash
if grep -q "ready" app.log; then
  printf 'service is ready\n'
else
  printf 'service is not ready\n' >&2
fi
```

### `[[ ... ]]` 条件表达式

Bash 脚本中优先使用 `[[ ... ]]` 组合条件。其内部不会执行单词分割和文件名展开，比传统的 `[ ... ]` 更不容易因空值或空格出错：

```bash
if [[ -f $file && -r $file ]]; then
  printf '%s is readable\n' "$file"
fi

if [[ $name == *.log ]]; then
  printf 'log file\n'
fi

if [[ $version =~ ^[0-9]+\.[0-9]+$ ]]; then
  printf 'valid version\n'
fi
```

常用条件：

| 表达式                    | 含义                       |
| ------------------------- | -------------------------- |
| `-e path`                 | 路径存在                   |
| `-f path` / `-d path`     | 是普通文件 / 目录          |
| `-L path`                 | 是符号链接                 |
| `-r path` / `-w path`     | 当前进程可读 / 可写        |
| `-x path`                 | 当前进程可执行或可进入目录 |
| `-s path`                 | 文件存在且大小大于 0       |
| `-z string` / `-n string` | 字符串为空 / 非空          |
| `a == b` / `a != b`       | 字符串相等 / 不相等        |
| `a -eq b` / `a -lt b`     | 整数相等 / 小于            |
| `a -nt b` / `a -ot b`     | 文件 `a` 比 `b` 新 / 旧    |

传统的 `test` 和 `[ ... ]` 仍适用于简单、可移植的单个条件，但不要使用容易产生歧义的 `-a`、`-o` 连接多个条件。Bash 中使用 `[[ condition1 && condition2 ]]`；POSIX `sh` 中使用 `[ condition1 ] && [ condition2 ]`

## 输入与 here document

### `read`

```bash
read -r -p "Name: " name            # -r：不把反斜杠当作转义符
read -r -s -p "Token: " token       # -s：不回显输入
printf '\n'
```

逐行读取文本时，使用 `IFS= read -r` 保留行首、行尾空白和反斜杠：

```bash
while IFS= read -r line || [[ -n $line ]]; do
  printf '%s\n' "$line"
done < "$file"
```

末尾的 `|| [[ -n $line ]]` 让脚本也能处理最后一行没有换行符的文件

需要读取命令输出并在循环后保留变量时，可以使用进程替换：

```bash
count=0
while IFS= read -r -d '' file; do
  ((count += 1))
  printf '%s\n' "$file"
done < <(find . -type f -print0)

printf 'count=%d\n' "$count"
```

这里使用进程替换 `< <(command)`，让循环后的 `count` 保留修改结果；管道的执行环境见前文“管道与逻辑列表”

### here document

```bash
cat <<EOF
user=$USER
date=$(date +%F)
EOF
```

未引用结束标记时，正文会执行变量展开、命令替换和算术展开。引用结束标记可以原样输出正文：

```bash
cat <<'EOF'
user=$USER
date=$(date +%F)
EOF
```

`<<-EOF` 会删除正文和结束标记开头的 **Tab**，方便在脚本中缩进，但不会删除普通空格

## 分支与循环

### `case`

```bash
case ${1:-} in
  start | stop | restart)
    action=$1
    ;;
  -h | --help)
    printf 'usage: %s {start|stop|restart}\n' "$0"
    exit 0
    ;;
  *)
    printf 'invalid action: %s\n' "${1:-<empty>}" >&2
    exit 2
    ;;
esac
```

`case` 使用 Shell 模式匹配，适合命令选项、文件扩展名和有限状态分支

### `for`、`while` 与 `until`

```bash
for file in ./*.log; do
  [[ -e $file ]] || continue
  printf '%s\n' "$file"
done

count=3
while ((count > 0)); do
  printf '%d\n' "$count"
  ((count -= 1))
done

until curl -fsS "http://127.0.0.1:8080/health" >/dev/null; do
  sleep 1
done
```

- `for` 遍历一组已经展开的值
- `while` 在条件成功时继续循环
- `until` 在条件失败时继续循环，直到条件成功
- `continue` 跳过本轮剩余命令，`break` 退出当前循环

不要使用 `for file in $(ls)` 遍历文件：命令替换的结果会再次执行单词分割和通配符展开，无法可靠处理空格、换行符等合法文件名。优先使用 glob、`find ... -exec`，或使用以 NUL 分隔的输入

## 数组

### 索引数组

```bash
files=("app.log" "access log.txt")
files+=("error.log")

printf '元素数量：%d\n' "${#files[@]}"
printf '第一个元素：%s\n' "${files[0]}"

for file in "${files[@]}"; do
  printf '<%s>\n' "$file"
done

unset 'files[1]'
```

`"${files[@]}"` 会把每个数组元素保留为独立参数；`"${files[*]}"` 会把全部元素合并为一个字符串。数组下标可以不连续，`${#files[@]}` 统计的是现存元素数量，不一定等于最大下标加一

### 关联数组

```bash
declare -A ports=(
  [http]=80
  [https]=443
)

printf '%s\n' "${ports[https]}"
for protocol in "${!ports[@]}"; do
  printf '%s=%s\n' "$protocol" "${ports[$protocol]}"
done
```

关联数组使用字符串键，是 Bash 扩展，不适用于 POSIX `sh`

## 清理、调试与静态检查

临时资源应通过 `trap` 在正常退出和错误退出时统一清理：

```bash
temp_dir=$(mktemp -d)

cleanup() {
  rm -rf -- "$temp_dir"
}

trap cleanup EXIT
```

`mktemp -d` 会安全地创建唯一目录。清理前仍应保证变量已成功赋值且目标范围明确，不要对空变量或未经校验的路径执行递归删除

```bash
bash -n script.sh              # 检查语法
bash -x script.sh arg1         # 执行并打印展开后的命令
shellcheck script.sh           # 静态检查常见引用、分词和可移植性问题
```

脚本内可以使用 `set -x` 开始追踪、`set +x` 停止追踪。追踪输出可能包含口令、令牌和路径等敏感信息，在 CI 日志或生产环境中启用前应先评估泄露风险
