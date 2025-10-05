# 物流財務台帳管理システム

物流货物代理业向けの財務台帳管理システム

## 🎯 项目概述

这是一个专为物流货物代理业开发的财务台账管理系统，主要处理进出口业务的费用收支、结算、支付流程管理。系统采用纯前端技术实现，使用localStorage进行数据存储，无需服务器即可运行。

### 主要功能

- 📊 **往来单位管理**：客户和供应商主数据管理
- 💰 **费用项目管理**：各类费用项目的定义和管理
- 📅 **支付条件管理**：支付条件和期限的设定
- 📋 **台账管理**：核心业务数据的录入和管理
- 🧾 **发票生成**：支持多币种、含税计算的发票生成
- 📄 **PDF输出**：符合日本财务规范的发票PDF生成
- 📈 **报表统计**：各类财务数据的统计分析

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器（Chrome, Firefox, Safari, Edge）

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/your-username/ans-logistics-finance-system.git
cd ans-logistics-finance-system
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **在浏览器中打开**
```
http://localhost:8080
```

## 📁 项目结构

```
ans-logistics-finance-system/
├── src/                    # 源代码目录
│   ├── components/          # UI组件
│   ├── pages/              # 页面组件
│   ├── utils/              # 工具函数
│   ├── data/               # 数据管理
│   └── styles/             # 样式文件
├── assets/                 # 静态资源
│   ├── css/                # 样式文件
│   ├── js/                 # 第三方库
│   └── images/             # 图片资源
├── docs/                   # 文档目录
├── tests/                  # 测试文件
├── scripts/                # 脚本文件
├── .trae/documents/        # 技术文档
├── index.html              # 主页面
├── package.json            # 项目配置
└── README.md               # 项目说明
```

## 🛠️ 开发指南

### 技术栈

- **前端**: Vanilla JavaScript (ES2020+)
- **样式**: CSS3 + Flexbox/Grid
- **PDF生成**: jsPDF + html2canvas
- **数据存储**: localStorage
- **构建工具**: 无需构建，直接使用浏览器运行

### 开发脚本

```bash
# 启动开发服务器
npm run dev

# 构建项目（验证代码）
npm run build

# 备份localStorage数据
npm run backup

# 导出数据
npm run export-data

# 导入数据
npm run import-data
```

### 代码规范

1. **文件命名**: 使用小写字母和连字符，如 `ledger-management.js`
2. **函数命名**: 使用驼峰命名法，如 `calculateTotalAmount()`
3. **变量命名**: 使用驼峰命名法，如 `customerData`, `invoiceItems`
4. **注释**: 重要函数和复杂逻辑需要详细注释
5. **错误处理**: 所有异步操作和关键函数都需要错误处理

## 📊 功能模块

### Phase 1 - 基础功能 (MVP)
- [x] 往来单位管理（客户/供应商）
- [x] 费用项目主数据管理
- [x] 支付条件主数据管理
- [x] 台账基础CRUD功能

### Phase 2 - 核心功能
- [ ] 子发票创建和管理
- [ ] 收费/付费明细管理
- [ ] 自动计算逻辑（含税、汇率）
- [ ] 状态管理和锁定功能

### Phase 3 - 完善功能
- [ ] PDF发票生成
- [ ] 数据备份/恢复
- [ ] 报表统计功能
- [ ] 权限管理（未来扩展）

## 🔧 核心功能说明

### 台账编号规则
```
母台账编号: ANS-YYMM0001 (年月+连号)
子发票编号: 母台账编号 + 字母后缀 (A, B, C...)
示例: ANS-250100001-A (2025年1月第1个台账的第1个子发票)
```

### 计算逻辑
```javascript
// 收费合计计算
收费课税外合计 = SUM(收费明细中区分='免税'的金额)
收费课税对象合计 = SUM(收费明细中区分='课税'的金额)
收费消费税 = Math.round(收费课税对象合计 × 0.1) // 四舍五入
收费合计 = 收费课税外合计 + 收费课税对象合计 + 收费消费税

// 毛利计算
毛利(税抜) = (收费课税外合计 + 收费课税对象合计) - (付费课税外合计 + 付费课税对象合计)
毛利(税込) = 收费合计 - 付费合计
```

## 📄 PDF输出规格

- **纸张尺寸**: A4纵向
- **字体**: 哥特体（无衬线字体）
- **包含内容**: 发票头部、明细表格、税额 breakdown、备注
- **文件名格式**: `请求书_{请求番号}_{YYYYMMDD}.pdf`

## 🔐 数据安全

### 本地存储结构
```javascript
// 数据存储在localStorage中的键名
ANS_CUSTOMERS_DATA      // 客户数据
ANS_EXPENSE_ITEMS_DATA  // 费用项目数据
ANS_PAYMENT_TERMS_DATA  // 支付条件数据
ANS_LEDGER_DATA         // 台账数据
ANS_SYSTEM_SETTINGS     // 系统设置
```

### 备份策略
- 自动备份: 每次重要操作后自动备份
- 手动备份: 通过npm脚本导出完整数据
- 数据恢复: 支持从备份文件恢复数据

## 🐛 常见问题

### Q: 数据会丢失吗？
A: 系统使用localStorage存储数据，只要不清除浏览器数据就不会丢失。建议定期使用备份功能。

### Q: 可以在多台电脑上使用吗？
A: 可以，通过数据导出/导入功能可以在不同设备间同步数据。

### Q: 支持哪些浏览器？
A: 支持Chrome、Firefox、Safari、Edge等现代浏览器的最新版本。

### Q: 如何更新系统？
A: 通过git pull获取最新代码，然后刷新浏览器即可。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者: ANS Supply Chain Co., Ltd.
- 邮箱: info@answer-supply.com
- 项目地址: [https://github.com/your-username/ans-logistics-finance-system](https://github.com/your-username/ans-logistics-finance-system)

---

**开发团队**: 物流财务台账管理系统开发组  
**最后更新**: 2024年12月
