# GitHub仓库设置指南

本指南将帮助您将项目推送到GitHub，实现多设备同步开发。

## 🚀 步骤1：创建GitHub仓库

### 方法一：通过GitHub网站创建

1. 访问 [GitHub.com](https://github.com) 并登录您的账户
2. 点击右上角的 "+" 图标，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `ans-logistics-finance-system`
   - **Description**: `物流財務台帳管理システム - 物流货物代理业财务台账管理系统`
   - **Visibility**: 选择 Public（公开）或 Private（私有）
   - **Initialize repository**: 不要勾选任何选项（因为我们已有本地代码）
4. 点击 "Create repository" 按钮

### 方法二：通过GitHub CLI创建（可选）

如果您安装了GitHub CLI，可以使用以下命令：

```bash
gh repo create ans-logistics-finance-system --private --description "物流財務台帳管理システム - 物流货物代理业财务台账管理系统"
```

## 📝 步骤2：初始化本地Git仓库

在您的项目目录中执行以下命令：

```bash
# 进入项目目录
cd /Users/lilinzi/Library/CloudStorage/OneDrive-新紀元旭東物流株式会社/アンサ/请求书系统/ANS-account

# 初始化Git仓库
git init

# 添加所有文件到暂存区
git add .

# 提交初始版本
git commit -m "Initial commit: 物流财务台账管理系统项目初始化"

# 添加远程仓库（将 YOUR_USERNAME 替换为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/ans-logistics-finance-system.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

## ⚙️ 步骤3：配置Git（首次使用）

如果您是第一次使用Git，需要配置用户信息：

```bash
# 配置用户名（替换为您的名字）
git config --global user.name "Your Name"

# 配置邮箱（替换为您的邮箱）
git config --global user.email "your.email@example.com"

# 配置默认分支名称为main
git config --global init.defaultBranch main
```

## 🔄 步骤4：日常开发工作流程

### 在新电脑上克隆项目

```bash
# 克隆项目到本地
git clone https://github.com/YOUR_USERNAME/ans-logistics-finance-system.git

# 进入项目目录
cd ans-logistics-finance-system

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 开发过程中的常用命令

```bash
# 查看当前状态
git status

# 添加修改的文件
git add .

# 提交修改
git commit -m "描述您的修改内容"

# 推送到GitHub
git push origin main

# 拉取最新代码（在其他电脑上）
git pull origin main
```

## 🌟 步骤5：GitHub功能配置

### 启用GitHub Pages（可选）

如果您希望通过网页直接访问项目：

1. 进入GitHub仓库页面
2. 点击 "Settings" 标签
3. 滚动到 "Pages" 部分
4. 在 "Source" 下选择 "Deploy from a branch"
5. 选择 "main" 分支和 "/ (root)" 目录
6. 点击 "Save"

项目将通过 `https://YOUR_USERNAME.github.io/ans-logistics-finance-system/` 访问

### 设置分支保护规则（推荐）

1. 进入仓库的 "Settings" > "Branches"
2. 点击 "Add rule"
3. 分支名称模式: `main`
4. 勾选以下选项：
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
5. 点击 "Create"

## 🛡️ 步骤6：数据同步最佳实践

### 开始工作前

```bash
# 确保本地代码是最新的
git pull origin main

# 如果有冲突，解决冲突后再继续
git status
```

### 完成工作后

```bash
# 查看修改了哪些文件
git status

# 添加所有修改
git add .

# 提交修改（写清晰的提交信息）
git commit -m "feat: 添加了客户管理功能

- 实现了客户CRUD操作
- 添加了客户搜索和筛选
- 优化了表单验证"

# 推送到GitHub
git push origin main
```

### 处理冲突

如果在拉取代码时出现冲突：

```bash
# 拉取最新代码
git pull origin main

# 如果有冲突，Git会提示哪些文件有冲突
# 手动编辑冲突文件，解决冲突

# 解决冲突后，添加文件
git add .

# 继续合并
git commit -m "resolve: 解决合并冲突"

# 推送解决冲突后的代码
git push origin main
```

## 📋 步骤7：常用Git命令速查

### 基本命令
```bash
git init                    # 初始化仓库
git clone <url>            # 克隆仓库
git add .                  # 添加所有文件
git commit -m "message"    # 提交修改
git push origin main       # 推送到远程仓库
git pull origin main       # 拉取远程修改
```

### 分支管理
```bash
git branch                 # 查看分支
git branch <name>         # 创建分支
git checkout <name>       # 切换分支
git merge <branch>        # 合并分支
```

### 查看历史
```bash
git log                    # 查看提交历史
git log --oneline         # 简化查看历史
git diff                   # 查看修改内容
```

### 撤销操作
```bash
git checkout -- <file>    # 撤销文件修改
git reset HEAD <file>     # 撤销暂存
git revert <commit>       # 撤销提交
```

## 🎯 步骤8：项目特定配置

### 更新package.json中的仓库地址

编辑 `package.json` 文件，将以下部分替换为您的实际仓库地址：

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/ans-logistics-finance-system.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/ans-logistics-finance-system/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/ans-logistics-finance-system#readme"
}
```

### 配置自动部署（可选）

项目已经包含了GitHub Actions工作流文件，可以自动部署到GitHub Pages：

- `.github/workflows/deploy.yml` - 自动部署到GitHub Pages
- `.github/workflows/ci.yml` - 持续集成测试

## 🚨 注意事项

1. **数据文件**: 不要提交包含敏感数据的备份文件到GitHub
2. **node_modules**: 这个目录已经被.gitignore排除，不会提交到GitHub
3. **大型文件**: GitHub有文件大小限制（100MB），不要提交大文件
4. **密钥信息**: 不要在代码中硬编码API密钥或敏感信息

## 📞 遇到问题？

如果在设置过程中遇到问题：

1. 检查GitHub仓库是否创建成功
2. 确认您的GitHub用户名和仓库名是否正确
3. 检查网络连接是否正常
4. 查看Git的错误提示信息
5. 参考GitHub官方文档：https://docs.github.com/

---

完成以上步骤后，您的项目就成功连接到GitHub了！现在您可以在任何电脑上通过`git clone`命令获取项目，实现多设备同步开发。