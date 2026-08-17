# Git

## Git 原理

**object 存储的最小单元（`.git/objects`）**

commit --> tree --> blob

- commit：存储提交记录
- tree：存储目录结构
- blob：存储文件内容

> `git cat-file -p <hash>` 查看对象 `-p` pretty-print 格式化打印
>
> 所有的分支和引用都指向某个提交对象

::: tip blob 清理
blob 对象一旦创建，其内容不可变；内容变化会生成新对象

`git reset` 使 blob 对象成为没有被引用的悬空对象

`git gc --prune=now` 立即清理不可达对象
:::

## 配置与日常操作

### 用户设置和 SSH key

```bash
git config --global user.name <name> &&            \
git config --global user.email <email> && \
git config --global core.autocrlf false &&            \
git config --global credential.helper store &&        \
git config --global init.defaultBranch main &&        \
git config --global core.filemode false

ssh-keygen -t rsa -C <message>
```

### 初始化与提交

```bash
git init                         # 初始化空 git 仓库
git clone <url>                  # 克隆远程仓库
git status                       # 查看工作区和暂存区状态
git add <file>                   # 将工作区的文件添加到暂存区
git rm -r --cached <file>        # 从暂存区移除并取消追踪文件，但保留物理文件
git commit -m <message>          # 将暂存区的文件提交到本地仓库
git commit --amend               # 修改最近一次的提交留言，或追加遗漏文件
git log --oneline --graph --all  # 查看所有分支日志
```

### 远程仓库

```bash
git remote add origin <url>      # 添加远程仓库关联
git remote set-url origin <url>  # 修改远程仓库 url
git remote -v                    # 查看远程仓库名称及其 URL
```

## 分支与远程协作

### 分支及其关系

- **本地分支**：可以直接提交，例如 `main`、`feature/login`
- **远程跟踪分支**：本地保存的远程分支状态，例如 `origin/main`。它在执行 `git fetch` 后更新，不能直接在其上提交
- **上游分支（upstream）**：与本地分支建立跟踪关系的远程分支。建立关系后，可以省略 `git pull`、`git push` 中的远程仓库名和分支名

```bash
git branch                    # 列出所有本地分支
git branch -a                 # 查看本地分支和远程跟踪分支
git branch -r                 # 仅查看远程跟踪分支
git branch -vv                # 查看本地分支及其上游和同步状态
git branch --show-current     # 查看当前分支名
```

### 创建、切换与关联

```bash
git switch <branch>              # 切换本地分支
git switch -c <branch>           # 创建并切换到新分支

# 创建本地分支并推送到远程，同时建立跟踪关系
git push -u origin <branch>

# 基于已有远程分支创建同名本地分支并建立跟踪关系
git fetch origin
git switch --track origin/<branch>

# 为已有本地分支设置或修改上游分支
git branch --set-upstream-to=origin/<branch>
```

当本地分支名与远程分支名不同时，可以明确指定推送目标：

```bash
git push -u origin <local_branch>:<remote_branch>
```

### 同步与合并

```bash
git fetch origin                 # 更新 origin/*，不修改工作区和当前分支
git fetch --prune                # 获取更新，并清理远程已删除分支的本地引用
git pull                         # 获取上游分支并合并到当前分支
git pull --rebase                # 获取上游分支，并将本地提交变基到其后
git push                         # 将当前分支推送到已设置的上游分支
git merge <branch>               # 合并指定分支到当前分支
git merge --no-ff <branch>       # 生成合并节点，保留特性分支历史痕迹
git merge --abort                # 遇到严重冲突时，撤销并恢复到合并前的状态
```

### 重命名和删除分支

重命名已经推送的分支，需要重命名本地分支、推送新分支，再删除旧远程分支：

```bash
git branch -m <old_branch> <new_branch>
git push -u origin <new_branch>
git push origin --delete <old_branch>

git branch -d <branch>                 # 删除已合并的本地分支
git branch -D <branch>                 # 强制删除本地分支，可能丢失未合并提交
git push origin --delete <branch>      # 删除远程分支
git fetch --prune                      # 清理失效的远程跟踪引用
```

## 临时保存修改

```bash
git stash push -m "message"   # 储藏已跟踪文件的修改
git stash push -u             # 储藏已跟踪文件的修改和未追踪的文件
git stash list                # 查看所有储藏记录
git stash pop                 # 恢复最近一次储藏，并从列表中删除该记录
git stash apply stash@{0}     # 恢复指定的储藏，但不删除记录
git stash drop stash@{0}      # 删除指定的储藏记录
git stash clear               # 清空所有储藏
```

## 撤销与回退

### restore

```bash
git restore <file>           # 撤销工作区物理文件的修改
git restore --staged <file>  # 把文件从暂存区退回工作区
```

### reset

```bash
git reset --soft HEAD~1      # 撤销 commit，代码保留在暂存区
git reset --mixed HEAD~1     # (默认) 撤销 commit 和 add，代码退回工作区
git reset --hard HEAD~1      # 撤销 commit，并彻底物理删除这部分代码
```

### revert

```bash
git revert <commit_id>       # 生成一个新提交，安全地抵消掉指定的提交
git push                     # 将抵消节点正常推送到远程
```

### reflog

```bash
git reflog                   # 获取本地曾经发生过的所有操作历史的 Hash
git reset --hard <hash>      # 强制回退到某个历史状态
```

## 整理提交历史

```bash
git rebase -i HEAD~3         # 交互式处理最近的 3 次提交

git cherry-pick <commit_id>    # 强行将某个指定的提交应用到当前分支
git cherry-pick <id_A>..<id_B> # 挑拣一段连续区间的提交
```

## 二分定位问题

```bash
git bisect start             # 开启二分查找排错模式
git bisect bad               # 标记当前所在版本是有 Bug 的
git bisect good <commit_id>  # 找到历史上没问题的一个版本，标记为 good
git bisect reset             # 查出罪魁祸首后，退出 bisect 模式
```
