# Changelog

本文件记录知识库文档的重要变更，格式参考 Keep a Changelog，并按变更类型进行归类。

## [Unreleased]

### Fixed

- 修正 `docs/frontend/css-pro.md` 中 `transition-timing-function` 示例的函数名拼写错误，确保示例使用正确的 `cubic-bezier` 表达式，避免误导读者。
- 修正 `docs/database/redis.md` 中 `GET` 命令示例的参数格式，移除错误的多余参数，确保命令写法与 Redis 实际语法一致。
- 修正 `docs/frontend/css-basic.md` 中重复渐变函数名称，统一为标准的 `repeating-linear-gradient()` 与 `repeating-radial-gradient()`。
- 修正 `docs/frontend/web-api.md` 中 `fetch` 示例的请求配置字段与响应克隆调用，确保示例使用正确的 `headers` 配置项和 `res.clone()` 方法。
- 修正 `docs/frontend/js-ts.md` 中 ES Module 示例的默认导出与导入代码，消除语法错误并统一导入导出关系。
- 修正 `docs/frontend/vite.md` 中环境配置合并示例的变量名错误，将未定义变量更正为 `viteProdConfig`。
- 修正 `docs/general/algorithm.md` 中线段树空间预估公式表述，改为工程实现中更常用且准确的 `4 * n` 预留策略说明。
- 修正 `docs/general/docker.md` 中 Dockerfile 示例的依赖文件名，将 `requirement.txt` 更正为 `requirements.txt`，使示例更符合 Python 项目的常见约定。
- 修正 `docs/general/docker.md` 中容器进入命令与镜像推送命令示例，避免将 `docker exec` 与 `docker push` 场景写错。
- 修正 `docs/general/git.md` 中 `git rm --cached` 与 `git commit` 的说明，避免误导为删除远端文件或使用错误的提交命令格式。
- 修正 `docs/general/network.md` 中关于 DNS 解析的描述，明确 DNS 解析用于获取域名对应的 IP 地址，而非获取端口信息，避免混淆网络分层职责。
- 修正 `docs/general/network.md` 中 HTTP/2 头部压缩说明及请求头字段拼写，统一为更准确的协议术语与标准字段名称。
- 修正 `docs/general/python.md` 中类型标注示例的导入列表，补充缺失的 `Union` 与 `Callable` 类型。
- 修正 `docs/nodejs/express.md` 中响应示例，明确一次请求只能发送一次响应，并将其他响应方式调整为互斥示例。
- 修正 `docs/nodejs/nestjs.md` 中自定义注入示例缺失的 `Inject` 导入，并调整全局守卫注册说明以匹配依赖注入方式。
- 修正 `docs/nodejs/nodejs-basic.md` 中 Buffer 示例的重复变量声明问题，避免示例代码在同一作用域内直接报错。
- 修正 `docs/vue/component-comm.md` 中 `v-bind` 展开属性的模板语法，确保 `useAttrs` 相关示例符合 Vue 模板规则。
- 修正 `docs/vue/vue-basic.md` 中 `watch` 示例对 `reactive` 对象的访问方式，避免将 `reactive` 误写为 `ref` 风格的 `.value` 访问。
- 修正 `docs/vue/vue-pro.md` 中 `KeepAlive` 的 `include` 绑定语法，确保模板示例可直接使用。
- 修正 `docs/vue/vue-router.md` 中 `params` 是否显示在地址栏的说明，改为与路径参数实际行为一致的表述。
