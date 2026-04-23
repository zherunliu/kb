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
blob 对象一旦被创建，就不会被修改或删除

`git reset` 使 blob 对象成为没有被引用的悬空对象

`git gc --prune=now` 立即清理所有过期对象
:::

## 基础操作

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

### 初始化、提交与远程交互

```bash
git init                         # 初始化空 git 仓库
git clone <url>                  # 克隆远程仓库
git status                       # 查看工作区和暂存区状态
git add <file>                   # 将工作区的文件添加到暂存区
git rm -r --cached <file>        # 从暂存区移除并取消追踪文件，但保留物理文件
git commit -m <message>          # 将暂存区的文件提交到本地仓库
git commit --amend               # 修改最近一次的提交留言，或追加遗漏文件
git log --oneline --graph --all  # 查看所有分支日志
git remote add origin <url>      # 添加远程仓库关联
git remote set-url origin <url>  # 修改远程仓库 url
git push -u origin main          # 推送并建立追踪关联 (-u --set-upstream)
git pull                         # 拉取远程代码并合并
git fetch                        # 仅拉取远程代码，但不自动合并
```

## 分支与工作流

### 基本分支操作

```bash
git branch                   # 列出所有本地分支
git switch <branch>          # 切换分支
git switch -c <branch>       # 创建并切换到新分支
git merge <branch>           # 合并指定分支到当前分支 (默认 Fast-Forward)
git merge --no-ff <branch>   # 强制生成合并节点, 保留特性分支历史痕迹
git merge --abort            # 遇到严重冲突时，一键撤销并恢复到合并前的状态
```

### stash

```bash
git stash save "message"     # 储藏当前未提交的所有修改
git stash list               # 查看所有储藏记录
git stash pop                # 恢复最近一次储藏，并从列表中删除该记录
git stash apply              # 恢复最近一次储藏，但不删除记录
git stash drop stash@{0}     # 删除指定的某条储藏记录
git stash clear              # 清空所有储藏
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

## 重构

```bash
git rebase -i HEAD~3         # 交互式处理最近的 3 次提交

git cherry-pick <commit_id>    # 强行将某个指定的提交应用到当前分支
git cherry-pick <id_A>..<id_B> # 挑拣一段连续区间的提交
```

## 二分排错

```bash
git bisect start             # 开启二分查找排错模式
git bisect bad               # 标记当前所在版本是有 Bug 的
git bisect good <commit_id>  # 找到历史上没问题的一个版本，标记为 good
git bisect reset             # 查出罪魁祸首后，退出 bisect 模式
```
