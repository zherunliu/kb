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

**用户设置和 SSH key：**

```bash
git config --global user.name <name> &&            \
git config --global user.email <email> && \
git config --global core.autocrlf false &&            \
git config --global credential.helper store &&        \
git config --global init.defaultBranch main &&        \
git config --global core.filemode false

ssh-keygen -t rsa -C <message>
```

**初始化、暂存、提交：**

```bash
git init                         # 初始化空 git 仓库
git status                       # 查看 git 状态
git add <file>                   # 将工作区的文件添加到暂存区
git rm -r --cached <file>        # 删除远程文件，并移除 git 追踪
git commit -m <message> [<file>] # 将暂存区的文件提交到本地库
git log                          # 查看 git 日志
git remote add origin <url>      # 添加远程仓库
git remote -v                    # 查看远程仓库
git push -u origin main          # 推送并建立关联(-u --set-upstream)
git remote remove <name>         # 删除关联
git push                         # 推送代码
git pull                         # 拉取代码并合并
git fetch                        # 拉取代码但不自动合并
```

**修改撤销：**

```bash
# 允许合并历史不相关的两个分支
git pull origin main --allow-unrelated-histories
# 未 push, 撤销提交, --soft 保存暂存状态
git reset --soft <ref>
# 已 push, 创建一个新提交以撤销提交
git revert HEAD
# 修改最后一次提交的作者信息
git commit --amend --author="name <email>" --no-edit
# 修改commit信息
git commit --amend
# 修改远程仓库 url
git remote set-url origin <url>
# 修改远程仓库名字
git remote rename <old-name> <new-name>
```
