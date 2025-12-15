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

## Controllers

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

## Providers

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

## Modules

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

## Interceptors

拦截器是一个用 `@Injectable()` 装饰器注解并实现了 `NestInterceptor` 接口的类

::: code-group

```ts [common/response.ts]
import { NestInterceptor, CallHandler, Injectable } from "@nestjs/common";
import { map, Observable } from "rxjs";

interface IData<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

// 响应拦截器
@Injectable()
export class Response<T> implements NestInterceptor {
  intercept(contest, next: CallHandler): Observable<IData<T>> {
    return next.handle().pipe(
      map((data: T) => {
        return {
          data,
          status: 0,
          message: "Intercepted by Response",
          success: true,
        };
      })
    );
  }
}
```

```ts [main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Response } from "./common/response";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置全局拦截器
  app.useGlobalInterceptors(new Response());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

:::

## Exception filters

Nest 内置了一个异常处理层，负责处理应用程序中所有未捕获的异常。当应用程序代码未处理某个异常时，该层会捕获它并自动返回用户友好的响应，默认情况下，这个功能由内置的全局异常过滤器实现，它能处理 `HttpException` 类型（及其子类）的异常。自定义异常过滤器可以精确控制流程以及返回给客户端的响应内容

::: code-group

```ts [common/filter.ts]
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    response.status(status).json({
      success: false,
      time: new Date(),
      data: exception,
      status,
      path: request.url,
    });
  }
}
```

```ts [main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpFilter } from "./common/filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置全局异常过滤器
  app.useGlobalFilters(new HttpFilter());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

:::

## Pipes

管道是一个用 `@Injectable()` 装饰器注解的类，它实现了 `PipeTransform` 接口

管道有两种典型用例：

- 转换：将输入数据转换为所需形式
- 验证：评估输入数据，若有效则原样传递；否则抛出异常

在这两种情况下，管道都对**控制器路由处理器**正在处理的参数进行操作。Nest 在方法调用前插入管道，管道接收目标方法的参数并对其进行操作

内置管道：
`ValidationPipe`，`ParseIntPipe`，`ParseFloatPipe`，`ParseBoolPipe`，`ParseArrayPipe`，`ParseUUIDPipe`，`ParseEnumPipe`，`DefaultValuePipe`

### 管道转换

管道绑定

```ts
@Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    console.log(typeof id);
    return this.catsService.findOne(+id);
  }
```

### 管道验证

```bash
pnpm add class-validator class-transformer
```

自定义管道
::: code-group

```ts [login/dto/create-login.dto.ts]
import { IsNotEmpty, IsString, Length, IsNumber } from "class-validator";

export class CreateLoginDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 6, {
    message: "用户名长度应为 2-6 个字符",
  })
  username: string;
  @IsNumber()
  password: number;
}
```

```ts [login/login.pipe.ts]
import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
// 使用控制台样式
import chalk from "chalk";

@Injectable()
export class LoginPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    console.log(chalk.green.bold("[value]:"), value);
    console.log(chalk.green.bold("[metadata]:"), metadata);
    if (!metadata.metatype) {
      return value;
    }
    const dto: unknown = plainToInstance(metadata.metatype, value);
    console.log(chalk.green.bold("[dto]:"), dto);
    if (typeof dto !== "object" || dto === null) {
      return value;
    }
    const errors = await validate(dto);
    if (errors.length) {
      console.log(chalk.red.bold("[errors]:"), errors);
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return value;
  }
}
```

:::

或者使用全局管道 `app.useGlobalPipes(new ValidationPipe());`

:::tip curl

**发送 GET 请求**

`curl https://localhost:3000/login`

**发送 POST 请求**

`curl -X POST -d "username=test&password=123456" https://localhost:3000/login`

`-H` 设置请求头 `-H "Content-Type: application/json"`

:::

## Guards

守卫是一个用 `@Injectable()` 装饰器注解的类，它实现了 `CanActivate` 接口，守卫在所有中间件之后执行，但在任何拦截器或管道之前执行
::: code-group

```ts [guard/role/role.guard.ts]
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const role = this.reflector.get<string[]>("role", context.getHandler());
    const request = context.switchToHttp().getRequest<Request>();
    console.log("This is guard...", role);
    if (role.includes(request.query.role as string)) {
      return true;
    }
    return false;
  }
}
```

```ts{5,10} [guard/guard.controller.ts]
import { Controller, Get, UseGuards, SetMetadata } from "@nestjs/common";
import { GuardService } from "./guard.service";
import { RoleGuard } from "./role/role.guard";
@Controller("guard")
@UseGuards(RoleGuard)
export class GuardController {
  constructor(private readonly guardService: GuardService) {}

  @Get()
  @SetMetadata("role", ["admin"])
  findAll() {
    return this.guardService.findAll();
  }
}
```

:::
或者使用全局管道 `app.useGlobalGuards(new RoleGuard());`

## 自定义装饰器

::: code-group

```ts [guard/role/role.decorator.ts]
import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from "@nestjs/common";
import { Request } from "express";
export const Role = (...args: string[]) => SetMetadata("role", args);

export const ReqUrl = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    console.log(data);
    return req.url;
  }
);
```

```ts{13,14} [guard/guard.controller.ts]
import { Controller, Get, UseGuards, SetMetadata } from "@nestjs/common";
import { GuardService } from "./guard.service";
import { RoleGuard } from "./role/role.guard";
import { ReqUrl, Role } from "./role/role.decorator";
@Controller("guard")
@UseGuards(RoleGuard)
export class GuardController {
  constructor(private readonly guardService: GuardService) {}
  static baseUrl = "http://localhost:3000";

  @Get()
  // @SetMetadata('role', ['admin'])
  @Role("admin")
  findAll(@ReqUrl(GuardController.baseUrl) url: string) {
    console.log(url);
    return this.guardService.findAll();
  }
}
```

:::

## 集成 swagger

swagger 通过利用装饰器来生成 openApi 规范

```bash
pnpm add @nestjs/swagger swagger-ui-express
```

在 `main.ts` 中用 `SwaggerModule` 初始化 swagger

```ts
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Cats example")
    .setDescription("The cats API description")
    .setVersion("1.0")
    .addTag("cats")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## 连接数据库

使用 typeORM

```bash
pnpm add @nestjs/typeorm typeorm mysql2
```

连接 mysql 数据库

::: code-group

```ts [app.module.ts]
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TestModule } from "./test/test.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      username: "user",
      password: "pass",
      host: "localhost",
      port: 3306,
      database: "db",
      autoLoadEntities: true, // 自动加载实体，生产环境不推荐
      synchronize: true, // 自动将 @Entity() 实体类同步到数据库
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```ts [test/test.module.ts]
import { Module } from "@nestjs/common";
import { TestService } from "./test.service";
import { TestController } from "./test.controller";
import { Test } from "./entities/test.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  // 导入 Test 实体
  imports: [TypeOrmModule.forFeature([Test])],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
```

:::

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

  // 允许跨域
  // const app = await NestFactory.create(AppModule, {cors: true});

  app.enableCors({
    origin: "http://localhost:5174",
    credentials: true,
  });

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

```vue{14,24-32} [App.vue]
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
        <!-- 使用 v-html -->
        <div v-html="svgHtml" @click="fetchCode"></div>
      </div>
    </el-form-item>
    <el-button type="primary" @click="submit">Submit</el-button>
  </el-form>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";

const svgHtml = ref<string>("");

const fetchCode = async () => {
  const newSvgHtml = await fetch("/api/user/captcha").then((res) => res.text());
  console.log("newSvgHtml:", newSvgHtml);
  svgHtml.value = newSvgHtml;
};

onMounted(fetchCode);

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

### multer

```bash
pnpm add multer @types/multer # 文件上传
pnpm add compressing # 流式下载
```

文件上传/下载
::: code-group

```ts [upload/upload.module.ts]
import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, "../images"),
        filename: (_, file, callback) => {
          const fileName = `${
            new Date().getTime() + extname(file.originalname)
          }`;
          return callback(null, fileName);
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
```

```ts [upload/upload.controller.ts]
import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Param,
  Query,
} from "@nestjs/common";
import { UploadService } from "./upload.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { join } from "path";
import type { Response } from "express";
import { zip } from "compressing";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("album")
  @UseInterceptors(FileInterceptor("file"))
  upload(@UploadedFile() file: Express.Multer.File) {
    console.log("[file]:", file);
    return true;
  }

  @Get("download/:filename")
  download(@Param("filename") filename: string, @Res() res: Response) {
    const url = join(__dirname, `../images/${filename}`);
    res.download(url);
  }

  @Get("stream")
  downloadStream(@Query("filename") filename: string, @Res() res: Response) {
    const url = join(__dirname, `../images/${filename}`);
    const tarStream = new zip.Stream();
    tarStream.addEntry(url);
    res.setHeader("Content-Type", "application/octet-stream");
    tarStream.pipe(res);
  }
}
```

```ts [main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 设置静态资源目录
  app.useStaticAssets(join(__dirname, "images"), { prefix: "/static" });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

```vue [App.vue]
<template>
  <el-button type="primary" @click="downloadStream">Download</el-button>
</template>

<script lang="ts" setup>
const useFetch = async (url: string) => {
  // const res = await fetch(url).then((res) => res.arrayBuffer());
  // const blob = new Blob([res]);
  const blob = await fetch(url).then((res) => res.blob());
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "hello.zip";
  link.click();
};

const downloadStream = () => {
  useFetch("/api/upload/stream?filename=hello.png");
};

const download = () => window.open("/api/upload/download/hello.png");
</script>
```

:::
