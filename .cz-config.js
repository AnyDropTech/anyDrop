const fs = require("fs");
const path = require("path");
const packages = fs.readdirSync(path.resolve(__dirname, "packages"));

module.exports = {
  types: [
    { value: "🎉 init", name: "init:     🎉初始化项目" },
    { value: "✨ feat", name: "feature:  ✨增加新功能" },
    { value: "🐛 fix", name: "fix:      🐛修复bug" },
    { value: "💄 ui", name: "ui:       💄更新UI" },
    { value: "🌈 style", name: "style:    🎨代码格式(不影响代码运行的变动)" },
    { value: "📝 docs", name: "docs:     📝文档变更" },
    { value: "🎈 perf", name: "perf:    🎈性能优化" },
    {
      value: "🦄 refactor",
      name: "refactor: 🦄重构(既不是增加feature，也不是修复bug)",
    },
    { value: "🔖 release", name: "release:  🔖发布" },
    { value: "🚀 deploy", name: "deploy:   🚀部署" },
    { value: "✅ test", name: "test:     ✅增加测试" },
    { value: "🌐 i18n", name: "i18n:     🌐国际化和本地化" },
    { value: "💩 poo", name: "poo:      💩写了屎一样的代码" },
    { value: "🍱 assets", name: "assets:   🍱增加/更新静态资源" },
    { value: "🐳 docker", name: "docker:   🐳Docker" },
    {
      value: "🔧 chore",
      name: "chore:    🔧构建过程或辅助工具的变动(更改配置文件)",
    },
    { value: "⏪ revert", name: "revert:   ⏪回退" },
    { value: "👷 build", name: "build:    👷打包" },
  ],
  scopes: ["other", ...packages],
  // override the messages, defaults are as follows
  messages: {
    type: "请选择提交类型:",
    customScope: "请输入您修改的范围(可选):",
    subject: "请简要描述提交 message (必填):",
    body: "请输入详细描述(可选，待优化去除，跳过即可):",
    footer: "请输入要关闭的issue(待优化去除，跳过即可):",
    confirmCommit: "确认使用以上信息提交？(y/n/e/h)",
  },
  allowCustomScopes: true,
  skipQuestions: ["body", "footer"],
  subjectLimit: 72,
};

