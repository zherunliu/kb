# Nestjs

## 创建 Nestjs 项目

```bash
pnpm install -g @nestjs/cli
nest new demo
```

## API 版本

::: code-group

```ts{3,7-9} [main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

```ts{5-8,18} [user/user.controller.ts]
import { Controller, Get, Param, Version } from "@nestjs/common";
import { UserService } from "./user.service";

// @Controller("user")
@Controller({
  path: "user",
  version: "1",
})
export class UserController {
  constructor(private readonly userService: UserService) {}
  // http://localhost:3000/v1/user
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // http://localhost:3000/v2/user/1
  @Version("2")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(Number.parseInt(id, 10));
  }
}
```

:::

## Controller

控制器负责处理传入的请求并向客户端返回响应。使用类和装饰器创建基本控制器，装饰器将类与必要的元数据关联起来，使 Nest 能够创建将请求连接到相应控制器的路由映射

| Decorator                                      | Description    |
| ---------------------------------------------- | -------------- |
| `@Get(), @Post(), @Put(), @Patch(), @Delete()` | 请求方法       |
| `@HttpCode(200)`                               | 响应状态码     |
| `@Headers("Content-Type", "application/json")` | 响应头参数     |
| `@Redirect(url?: string, statusCode?: number)` | 重定向         |
| `@Request()`, `@Req()`                         | 请求对象       |
| `@Response()`, `@Res()`                        | 响应对象       |
| `@Next()`                                      | 放行函数       |
| `@Session()`                                   | 会话对象       |
| `@Param(key?: string)`                         | url 路径参数   |
| `@Body(key?: string )`                         | 请求体参数     |
| `@Query(key?: string)`                         | 请求行参数     |
| `@Headers(key?: string)`                       | 请求头参数     |
| `@Ip()`                                        | 请求 IP        |
| `@HostParam(key?: string)`                     | 请求 host 参数 |

::: tip 库特定方法

`@Res()` 或 `@Response()` 为底层原生平台的 response 对象接口。在方法处理程序中注入 `@Res()` 或 `@Response()` 时，该处理程序将进入库特定模式，此时需手动管理响应。必须通过调用 response 对象方法（如 `res.json(...)` 或 `res.send(...)`）返回响应，否则 HTTP 服务器会挂起。使用 `@Res({ passthrough: true }) res: Response` 可以操作原生响应对象，同时仍允许框架处理其余部分
:::

## Provider

提供者是 Nest 中的基本构建块，许多基础的 Nest 类（如服务、存储库、工厂和辅助工具）都可以被视为提供者。它们可以注入到控制器或其他提供者中，以实现松散耦合和更好的测试性

### Ioc/DI

控制反转 （IoC）是一种设计原则，其中对象的创建和依赖关系的管理由外部容器负责，而不是由对象本身负责。依赖注入 （DI） 是实现 IoC 的一种方式，通过将依赖项作为参数传递给对象的构造函数或方法，从而实现对象之间的解耦

::: code-group

```ts [user/user.service.ts]
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {}
```

```ts [user/user.controller.ts]
import { Controller } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}
}
```

```ts [user/user.module.ts]
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

:::

> 1.  在 `user.service.ts` 文件中，`@Injectable()` 装饰器将 UserService 类声明为可由 Nest IoC 容器管理的类
> 2.  在 `user.controller.ts` 文件中，UserController 通过构造函数注入声明了对 UserService 令牌的依赖：
>     `constructor(private userService: UserService)`
> 3.  在 `user.module.ts` 中，将 UserService 令牌与来自 `user.service.ts` 文件的 UserService 类进行关联

### 自定义提供程序

::: code-group

```ts [user/user.module.ts]
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: "user-service",
      useClass: UserService,
    }, // 类提供者 useClass
    {
      provide: "injectable-value",
      useValue: ["React", "Vue3", "Angular"],
    }, // 值提供者 useValue,
    {
      provide: "injectable-factory-method",
      inject: [UserService, "user-service"],
      async useFactory(userService: UserService, userService2: UserService) {
        return await new Promise((resolve) => {
          setTimeout(() => {
            resolve(userService === userService2);
          }, 2000);
        });
      },
    }, //工厂提供者 useFactory
  ],
})
export class UserModule {}
```

```ts [user/user.controller.ts]
import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('user-service') private readonly userService2: UserService,
    @Inject('injectable-value') private readonly injectedArray: string[],
    @Inject('injectable-factory-method') private readonly returnValue: boolean,
  ) {}
```

:::

## Module

模块是一个用 `@Module()` 装饰器注解的类。该装饰器提供了元数据，Nest 使用它来有效地组织和管理应用程序结构。在 Nest 中，模块默认是单例的，因此可以在多个模块之间共享同一个提供者实例

### 模块导出

```ts{8}
import { Module } from "@nestjs/common";
import { CatsService } from "./cats.service";
import { CatsController } from "./cats.controller";

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

> - 将提供者添加到模块的 exports 数组来导出，任何导入 `CatsModule` 的模块都可以访问 `CatsService`，并且将与所有其他导入该模块的模块共享同一个实例
> - 使用 `Global()` 装饰的全局模块只需在根模块注册一次，其他模块无需导入

### 动态模块

::: code-group

```ts [config/config.module.ts]
import { DynamicModule, Module } from "@nestjs/common";

@Module({})
export class ConfigModule {
  static forRoot(options: string): DynamicModule {
    return {
      // 作为全局模块导出
      global: true,
      module: ConfigModule,
      providers: [
        {
          provide: "Config",
          useValue: { path: "/api" + options },
        },
      ],
      exports: ["Config"],
    };
  }
}
```

```ts [app.module.ts]
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CatsModule } from "./cats/cats.module";
import { ConfigModule } from "./config/config.module";

@Module({
  imports: [CatsModule, ConfigModule.forRoot("/hello")], // 可以动态传参
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```ts [app.controller.ts]
import { Controller, Get, Inject } from "@nestjs/common";
@Controller()
export class AppController {
  constructor(@Inject("Config") private readonly path: { path: string }) {}

  @Get()
  getHello() {
    return this.path;
  }
}
```

:::

## Middleware

默认情况下，Nest 中间件等同于 express 中间件
::: code-group

```ts [logger/logger.middleware.ts]
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // res.send('Intercepted by LoggerMiddleware');
    next();
  }
}
```

```ts [user/user.module.ts]
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { LoggerMiddleware } from "../logger/logger.middleware";

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes('user');
    // consumer.apply(LoggerMiddleware).forRoutes(UserController);
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "user/captcha", method: RequestMethod.POST });
  }
}
```

:::

### 全局中间件

全局中间件以函数的形式定义（非全局中间件也可以使用函数的形式），在 `main.ts` 中使用 `app.use()` 方法注册

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Handler, Request, Response, NextFunction } from "express";

const globalMiddleware: Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.originalUrl);
  next();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(globalMiddleware);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## 案例

### session

```bash
pnpm add express-session @types/express-session
```

验证码案例

::: code-group

```ts [main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import session from "express-session";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: "salt",
      rolling: true,
      name: "cookie-name",
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60,
      },
    })
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

```ts [user/user.controller.ts]
import { Controller, Get, Post, Body, Res, Session } from "@nestjs/common";
import { UserService } from "./user.service";
import svgCaptcha from "svg-captcha";
import { type Response } from "express";

interface ISession {
  cookie: {
    path: string;
    _expires: Date;
    originalMaxAge: number;
    httpOnly: boolean;
  };
  code?: string;
}

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("captcha")
  createCaptcha(@Res() res: Response, @Session() session: ISession) {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 30,
      width: 70,
      height: 30,
      background: "#40bf9b88",
    });
    session.code = captcha.text;
    res.type("image/svg+xml");
    res.send(captcha.data);
  }

  @Post("create")
  createUser(
    @Body() body,
    @Session() session: ISession,
    @Body("captcha") bodyCaptcha: string
  ) {
    console.log(body, session);
    const sessionCaptcha = session.code ?? "";
    if (bodyCaptcha.toLowerCase() === sessionCaptcha.toLowerCase()) {
      return { code: 200 };
    } else {
      return {
        code: 400,
      };
    }
  }
}
```

```ts [vite.config.ts]
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000/",
        changeOrigin: true,
        // 去掉 /api 前缀
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

```vue [App.vue]
<template>
  <el-form label-width="auto" :model="loginData" style="max-width: 600px">
    <el-form-item label="Name">
      <el-input v-model="loginData.name" />
    </el-form-item>
    <el-form-item label="Password">
      <el-input type="password" show-password v-model="loginData.password" />
    </el-form-item>
    <el-form-item label="Captcha">
      <div style="display: flex">
        <el-input v-model="loginData.captcha" />
        <img @click="resetCode" :src="codeUrl" alt="" />
      </div>
    </el-form-item>
    <el-button type="primary" @click="submit">Submit</el-button>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
const codeUrl = ref<string>("/api/user/captcha");

const resetCode = () => {
  codeUrl.value = `/api/user/captcha?time=${new Date().getTime()}`;
};

const loginData = reactive({
  name: "rico",
  password: "hello123",
  captcha: "",
});

const submit = () => {
  fetch("/api/user/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.code !== 200) {
        resetCode();
      }
    });
};
</script>
```

:::
