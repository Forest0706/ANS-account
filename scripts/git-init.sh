# Git 初始化脚本

# 设置您的GitHub用户名（请修改为您的实际用户名）
GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="ans-logistics-finance-system"

# 配置Git用户信息（请修改为您的信息）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 初始化Git仓库
echo "🚀 正在初始化Git仓库..."
git init

# 添加所有文件
echo "📦 正在添加文件到暂存区..."
git add .

# 提交初始版本
echo "💾 正在提交初始版本..."
git commit -m "Initial commit: 物流财务台账管理系统项目初始化

- 添加了完整的项目结构
- 包含所有技术文档和用户文档
- 配置了开发环境和依赖
- 设置了GitHub Actions工作流"

# 添加远程仓库
echo "🔗 正在添加远程仓库..."
git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git

# 创建并切换到main分支
git branch -M main

# 推送到GitHub
echo "📤 正在推送到GitHub..."
git push -u origin main

echo "✅ Git初始化完成！"
echo "📋 您的仓库地址: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo ""
echo "🔧 下一步操作："
echo "1. 访问上述仓库地址确认项目已上传"
echo "2. 配置GitHub Pages（可选）"
echo "3. 在其他电脑上使用 'git clone' 命令获取项目"
echo ""
echo "📚 参考文档："
echo "- GitHub设置指南: docs/github-setup-guide.md"
echo "- 项目README: README.md"
echo "- 技术架构: .trae/documents/technical-architecture.md"