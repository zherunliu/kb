# Next.js

## 渲染方式与组件类型

### CSR、SSR、SSG、ISR

CSR（Client-Side Rendering）

服务器通常先返回基础 HTML 和 JavaScript。浏览器执行 JavaScript、获取数据，然后生成页面的主要内容

- 优点：页面加载完成后的交互和局部更新比较灵活；服务器不需要为每次请求生成完整 HTML
- 缺点：首次显示主要内容需要等待 JavaScript 和数据请求；JavaScript 包较大时会影响首屏速度，也不利于不执行 JavaScript 的搜索引擎或爬虫读取内容

SSR（Server-Side Rendering）

服务器在每次收到请求时获取数据并生成 HTML，再把结果返回给浏览器

- 优点：浏览器可以较早看到完整内容，有利于首屏展示和 SEO；适合实时或因用户而异的数据
- 缺点：每次请求都需要服务端计算，服务器压力和响应时间通常高于直接返回静态文件；缓存也更复杂

SSG（Static Site Generation）

页面在构建时预先生成，访问时直接返回已经生成的静态内容，通常还可以通过 CDN 分发

- 优点：访问速度快，服务器压力小，容易缓存，也有利于 SEO
- 缺点：数据更新后需要重新构建和部署；页面很多时，构建时间可能较长

ISR（Incremental Static Regeneration）

ISR 在 SSG 的基础上，按照设定的时间或触发条件重新生成页面并更新缓存，不需要重新构建整个站点

- 优点：保留静态页面访问快、服务器压力小的优点，同时可以让内容定期或按需更新
- 缺点：更新不是实时的，在重新生成完成前可能读到旧内容；缓存和重新验证规则比 SSG 更复杂

### RSC、RCC

App Router 中的组件默认是 RSC（React Server Component）。它在服务端执行，可以直接读取服务端数据，并且组件代码不会进入客户端 JavaScript 包。RSC 可以参与 SSR，也可以在构建或重新验证时参与 SSG、ISR，因此它不等同于 SSR

需要使用状态、事件、Effect 或浏览器 API 时，在文件顶部添加 `"use client"`，将其作为 RCC（React Client Component）的入口。RCC 的代码需要发送到浏览器，但它不等同于 CSR：首次访问页面时，Next.js 默认仍会在服务端预渲染包含 RCC 的 HTML，然后在浏览器中进行水合（Hydration），使其可以交互；页面的主要内容依赖浏览器执行 JavaScript 后生成时，才是在使用 CSR

> Next.js 支持流式渲染（HTTP/1.1 `Transfer-Encoding: chunked`；HTTP/2 通过连续的 DATA 帧传输，并以 `END_STREAM` 标记结束），RSC 可以在服务端边渲染边发送 HTML，RCC 也可以在浏览器边水合边执行 JavaScript
> 服务器组件中可以导入客户端组件，客户端组件中不能直接导入服务器组件
> 在模块中导入 `server-only`，可以在该模块被 Client Component 错误引用时产生构建错误

## CLI

```bash
pnpm create next-app@latest
```

## App Router

Next.js 使用文件系统路由，`app` 目录下的文件和目录会自动映射为路由。每个目录都可以包含一个 `page.tsx` 文件，作为该路由的入口组件

```shell
app/
├── page.tsx           # /
├── about/
│   └── page.tsx       # /about
├── users/
│   └── page.tsx       # /users
├── posts/
│   └── [id]/
│       └── page.tsx   # /posts/:id
├── layout.tsx
├── template.tsx
├── loading.tsx        # 基于 Suspense 异步组件
├── error.tsx
└── not-found.tsx      # 全局 404 页面
```

`<Layout/>` 组件会包裹 `<Template/>` 组件，`<Template/>` 组件会在路由切换时卸载和重新挂载，而 `<Layout/>` 只挂载一次，其子组件会保持状态和 DOM 节点不变

## 路由导航

### `<Link />`

```tsx
<Link href={{ pathname: "/about", query: { name: "rico", age: 24 } }}>
  /about?name=rico&age=24
</Link>

<Link
  href="/about"
  // true：显式预取完整路由；省略时使用 auto/null 自动策略
  prefetch
  // 禁止 Next.js 自动调整滚动位置
  scroll={false}
  // history.replaceState()
  replace
>/about</Link>
```

### useRouter hook

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function AppPage() {
  const router = useRouter();
  return (
    <>
      <button onClick={() => router.push("/about")}>history.pushState()</button>
      <button onClick={() => router.replace("/about")}>
        history.replaceState()
      </button>
      <button onClick={() => router.back()}>history.back()</button>
      <button onClick={() => router.forward()}>history.forward()</button>
      <button onClick={() => router.refresh()}>refresh /</button>
      <button onClick={() => router.prefetch("/about")}>prefetch /about</button>
    </>
  );
}
```

### redirect/permanentRedirect

- `redirect`：通常返回 307 Temporary Redirect；在 Server Action 中返回 303 See Other
- `permanentRedirect`：返回 308 Permanent Redirect

```ts
import { redirect, RedirectType, permanentRedirect } from "next/navigation";

redirect("/login");
// redirect("/login", RedirectType.push);
// redirect("/login", RedirectType.replace);
// permanentRedirect("/new-location");
```

## 动态路由、平行路由、路由组

### 动态路由

- `[id]`：捕获单个路径参数
- `[...id]`：捕获多个路径参数
- `[[...id]]`：捕获多个路径参数，参数可以为空

```tsx
// app/about/[[...id]]/page.tsx
"use client";
import { useParams } from "next/navigation";

export default function About() {
  const { id } = useParams();
  return <div>AboutPage id: {id}</div>;
}
```

### 平行路由

在同一个路由层级下定义多个并行的路由，这些路由可以同时渲染

```shell
app
├── @header
│   ├── default.tsx
│   ├── page.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   └── parallel
│       └── page.tsx
├── @footer
│   ├── default.tsx
│   └── page.tsx
├── default.tsx
├── layout.tsx
└── page.tsx
```

```tsx
import Link from "next/link";

export default function RootLayout({
  children,
  header,
  footer,
}: Readonly<{
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {header}
        {children}
        {footer}
        <Link href="/parallel">Parallel</Link>
      </body>
    </html>
  );
}
```

### 路由组

在同一个路由层级下，可以使用括号目录对路由进行分组，分组名称不会出现在 URL 中

```shell
app
├── (group1)
│   └── user
│       └── page.tsx # /user
├── (group2)
│   └── manager
│       └── page.tsx # /manager
├── layout.tsx # 也可以定义各自的 layout.tsx
└── page.tsx
```

## 后端路由

- 在 `app` 目录中使用 `route.ts` 定义 Route Handler
- Route Handler 支持 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD` 和 `OPTIONS` 方法

::: code-group

```ts [app/api/user/route.ts]
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name");
  return NextResponse.json({
    message: `Hello, ${name}!`,
  });
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  return NextResponse.json(
    {
      message: `Hello, ${name}!`,
    },
    { status: 201 },
  );
}
```

```ts [app/api/user/[name]/route.ts]
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  return NextResponse.json({
    message: `Hello, ${name}!`,
  });
}
```

:::

## cookie

```ts
// app/api/login/route.ts
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (token && token.value === "admin-token") {
    return NextResponse.json(
      { code: 1, message: "Login successful" },
      { status: 200 },
    );
  } else {
    return NextResponse.json(
      { code: 0, message: "Login failed" },
      { status: 401 },
    );
  }
}
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.name === "admin" && body.password === "admin") {
    const cookieStore = await cookies();
    cookieStore.set("token", "admin-token", {
      maxAge: 60 * 60 * 24 * 7, // 7 days,
      httpOnly: true, // 禁止客户端访问
      path: "/", // 作用域为根路径
    });
    return NextResponse.json(
      { code: 1, message: "Login successful" },
      { status: 200 },
    );
  } else {
    return NextResponse.json(
      { code: 0, message: "Login failed" },
      { status: 401 },
    );
  }
}
```

## [AI-SDK](https://ai-sdk.dev/)

```shell
pnpm add ai @ai-sdk/deepseek @ai-sdk/react
```

::: code-group

```tsx [app/api/chat/route.ts]
import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import type { NextRequest } from "next/server";

const deepSeek = createDeepSeek({ apiKey: process.env.API_KEY || "" });

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: deepSeek("deepseek-chat"),
    messages: await convertToModelMessages(messages),
  });
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
```

```tsx [app/chat/page.tsx]
"use client";

import { useChat } from "@ai-sdk/react";
import { type SubmitEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages.at(-1);

  useEffect(() => {
    if (!lastMessage) return;

    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMessage]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = input.trim();
    if (!text) return;

    sendMessage({ text });
    setInput("");
  };

  return (
    <main className="mx-auto flex h-dvh w-full max-w-xl flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((message) => (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.role === "user" ? "User: " : "AI: "}
            {message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <div key={`${message.id}-${i}`}>{part.text}</div>;
                default:
                  return null;
              }
            })}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form
        className="flex shrink-0 gap-2 border-t bg-background p-4"
        onSubmit={handleSubmit}
      >
        <Input
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <Button type="submit" disabled={!input.trim()}>
          Send
        </Button>
      </form>
    </main>
  );
}
```

:::

## proxy

```ts
// app/proxy.ts
import { type NextRequest, NextResponse, type ProxyConfig } from "next/server";

export async function proxy(request: NextRequest) {
  console.log("[proxy] url:", request.url);
  const { pathname } = request.nextUrl;
  console.log("[proxy] pathname:", pathname);
  if (pathname.startsWith("/home")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api")) {
    const cookie = request.cookies.get("token");
    if (pathname === "/api/login" || cookie) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config: ProxyConfig = {
  // matcher: "/home/:path*"
  // matcher: ["/home/:path*", "/api/:path*"]
  // matcher: ["^(/home/.*)$"]

  matcher: [
    "/home/:path*",
    {
      source: "/api/login",
      has: [{ type: "header", key: "Content-Type", value: "application/json" }],
    },
    {
      source: "/api/user",
      // 需要匹配
      has: [
        { type: "cookie", key: "token", value: "admin-token" },
        { type: "query", key: "username", value: "rico" },
      ],
      // 需要不匹配
      missing: [{ type: "query", key: "username", value: "root" }],
    },
  ],
};
```

允许跨域

```ts
import { type NextRequest, NextResponse, type ProxyConfig } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([k, v]) => {
    response.headers.set(k, v);
  });
  return response;
}

export const config: ProxyConfig = {
  matcher: "/api/:path*",
};
```
