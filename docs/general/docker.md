# Docker

## 技术原理

Docker 使用了 Linux 内核的容器化技术来实现轻量级的虚拟化。它允许开发者将应用程序及其依赖打包在一个独立的容器中，从而确保在不同环境中运行的一致性

- Cgroups：控制资源分配和限制，可以为每个容器设定 CPU，内存，网络带宽等资源的使用上限，确保容器的资源消耗不会影响到宿主机和其他容器的运行
- Namespaces：隔离进程的视图，使容器只能看到自己内部的进程 ID，网络资源，文件目录，使其认为自己在独立的系统中运行

## 基础命令

### 镜像

**拉取镜像：**

`docker pull docker.io/library/nginx:latest`
等同于
`docker pull nginx`

- `docker.io`: registry 仓库地址/注册表，默认 docker.io
- `library`: 命名空间，默认 library
- `nginx`: 镜像名称
- `latest`: 标签（tag），默认 latest

> 拉取特定架构的镜像 `--platform`
>
> `docker pull --platform=linux/amd64 nginx:latest`

**查看镜像：**
`docker images`

**删除镜像：**
`docker rmi <IMAGE ID/NAME>`

### 容器

**运行容器：**

`docker run -d -p 8080:80 --name mynginx nginx:latest`

- 通过镜像创建一个容器并运行（`create` 仅创建），如果没有这个镜像则自动拉取
- `-d`：detached mode，后台运行容器
- `-p 8080:80`：端口映射，将宿主机的 8080 端口映射到容器的 80 端口
- `--name mynginx`：指定容器名称为 mynginx
- `-v 宿主机目录 : 容器目录`：目录映射，数据持久化保存（绑定挂载）
- `-e`：传递环境变量
- `--restart`：重启策略，`always`：停止则重启；`unless-stopped`：手动停止不重启

> 使用绑定挂载时，宿主机目录会暂时覆盖容器目录，而使用命名挂载时，容器的文件夹会同步到命名卷中

**查看容器：**
`docker ps`：查看正在运行中的容器，`-a` 查看所有容器

**启停容器：**

- `docker start <CONTAINER_ID/NAME>`
- `docker stop <CONTAINER_ID/NAME>`

**进入容器：**

- `docker run -it --rm <CONTAINER_ID/NAME>`：`-it` 可交互的终端环境，`--rm` 退出时删除容器
- `docker exec <CONTAINER_ID/NAME> <shell>`：执行 shell 命令，如 `ps -ef` 查看进程信息
- `docker exec -it <CONTAINER_ID/NAME> bash/sh`：进入容器交互终端执行

**删除容器：**
`docker rm -f <CONTAINER_ID/NAME>`：`-f` 强制删除在运行中的文件

**容器日志：**
`docker logs <CONTAINER_ID/NAME>`：`-f` 持续输出，滚动查看

> `cat /etc/os-release`：查看容器内部 linux 版本，便于后续安装

### 卷

- `docker volume create <VOLUME_NAME>`：创建卷
- `docker volume list`：查看所有卷
- `docker volume inspect <VOLUME_NAME>`：查看卷信息
- `docker volume rm <VOLUME_NAME>`：删除卷
- `docker volume prune -a`：删除未使用卷

## Dockerfile

::: code-group

```Dockerfile [Dockerfile]
# 基础镜像
FROM python:3.13-slim
# 镜像内工作目录
WORKDIR /app
# 本地当前目录 镜像内当前目录
COPY . .
# 镜像内命令
RUN pip install -r requirement.txt
# 仅做声明效果
EXPOSE 8000
# 容器启动时命令 ENTRYPOINT 优先级更高
CMD ["python3", "main.py"]
```

```bash [bash]
# 构建镜像
docker build -t docker-test .
# 运行容器
docker run -d -p 8000:8000 docker-test

# 推送镜像
docker login
docker pull username/docker_test
```

:::

## Docker 网络

### Bridge 模式

Docker 网络默认 Bridge（桥接模式），所有的容器都连接到这个网络中，每一个容器都分配了一个内部的 IP 地址，一般都是 172.17 开头。在这个内部子网里面，容器可以通过内部 IP 地址互相访问

可以使用 `docker network create <NETWORK_NAME>` 命令创建子网，默认情况下，子网也是桥接模式的一种，然后指定容器加入不同的子网`--network <NETWORK_NAME>`，同一个子网内的容器可以互相通信（直接使用名称），而跨子网则不可以通信

### Host 模式

Host 模式下，docker 容器直接共享宿主机的网络，容器直接使用宿主机的 IP 地址 `--network host` ，无需 `-p` 参数进行端口映射，容器内的服务直接运行在宿主机的端口上，通过宿主机的 IP 和端口就能访问到容器中服务

### None 模式

不联网

**查看网络：**
`docker network list`

**删除自定义网络：**
`docker network rm <NETWORK ID/NAME>`

## Docker Compose

Docker Compose 轻量级容器编排技术，本质是将多个 docker 命令抽象为一个 YAML 配置文件，在这个文件中记录了容器之间如何创建以及如何协同工作，简化多容器应用的管理

```yaml
services:
  my_mongodb:
    image: mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: name
      MONGO_INITDB_ROOT_PASSWORD: pass
    volumes:
      - /my/datadir:/data/db

  my_mongodb_express:
    image: mongo-express
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_SERVER: my_mongodb
      ME_CONFIG_MONGODB_ADMINUSERNAME: name
      ME_CONFIG_MONGODB_ADMINPASSWORD: pass
    depends_on:
      - my_mongodb
```

- `docker compose up -d` 运行
- `docker compose down -v` 删除（-v 同时删除卷）
- `docker compose stop` 停止
- `docker compose start` 启动

> - 同一个 compose 文件中，定义的所有容器都会自动加入同一个子网
>
> - 执行 `docker compose up` 时，会检测当前目录下名为 `docker-compose.yaml` 或 `compose.yaml` 文件。可以通过 `docker compose -f test.yaml up -d` 指定 compose 文件
