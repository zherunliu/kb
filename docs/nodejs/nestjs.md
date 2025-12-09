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
