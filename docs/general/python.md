# Python

## 类型标注

```python
from typing import List, Tuple, Dict, Set, Optional, NoReturn, Literal, Union, Callable
a: int = 528
b: float = 5.28
c: str = "rico"

# list([5, 2, 8])
d: List[int] = [5, 2, 8]

# list([528, 5.28, "happy", "brave"])
# python 3.10+ 支持 list[int|float|str]
e: List[Union[int, float, str]] = [528, 5.28, "happy", "brave"]

# tuple((528, 5.28, "rico"))
f: Tuple[int, float, str] = (528, 5.28, "rico")

# dict({528: "happy", 5.28: "brave"})
g: Dict[Union[int, float], str] = {528: "happy", 5.28: "brave"}

# set({528, 5.28})
h: Set[Union[int, float]] = {528, 5.28}

def fn(a: int, b: int) -> str:
    return str(a + b)

# fn 的类型是 Callable[[int, int], str]
fn2: Callable[[int, int], str] = fn

class Node:
    def __init__(self, pre: "Node"):
        self.pre = pre # 此时 Node 还没有被定义，可以使用双引号
        self.next = None

# 使用 Optional 表示 int 或 None
def f(x: Optional[int]) -> int:
    if x is None:
        return 0
    return x

def error() -> NoReturn:
    raise ValueError

Tgender = Literal['female', 'male']
```

## 输入输出

### 输入处理

| 输入格式               | python 代码                                                    |
| ---------------------- | -------------------------------------------------------------- |
| 单个整数输入           | `n = int(input())`                                             |
| 单行多个整数           | `arr = list(map(int, input().split()))`                        |
| n 行整数               | `arr = [int(input()) for _ in range(n)]`                       |
| n 行，每行 m 个整数    | `matrix = [list(map(int, input().split())) for _ in range(n)]` |
| 大规模输入 (更快)      | `n = int(sys.stdin.readline().strip())`                        |
| 多行未知数量输入 (EOF) | `data = sys.stdin.read().splitlines()`                         |
| 读取整行字符串         | `text = input().strip()`                                       |
| 读取 JSON 输入         | `data = json.loads(sys.stdin.read())`                          |

> `strip()` 移除字符串两端的空行
>
> `splitlines()` 用换行符分隔

需要逐行处理可以使用 `sys.stdin` + `for` 循环，如：

```python
import sys

for line in sys.stdin:  # 持续读取每一行，直到 EOF
    line = line.strip()  # 去除换行符和空格
    if not line:  # 处理空行
        continue
    num = int(line)
    print(num * num)
```

- `read()` 一次性读取整个文件或输入流，并返回字符串，`read(size)` 最多读取 `size` 个字节

- `readline()` 每次调用 `readline()` 读取一行，返回字符串（包括换行符 `\n`）

- `readlines()` 一次性读取所有行，返回一个列表（每个元素是一个字符串，带 `\n`）

- `input()` 从终端读取一行用户输入，返回字符串（默认不带换行 `\n`）可以传入输入提示参数，如：`input("Enter a number: ")`

### 格式化输出

占位符 `%`

```python
name = "rico"
age = 24
print("Hello %s, you are %d years old" % (name, age))
```

- 对于小数可用 `%.3f` 保留精度
- 位数默认右对齐，`-` 表示左对齐，`0` 表示用 0 补齐
