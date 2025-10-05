# 物流财务台账管理系统 - 开发实施计划

## 1. 开发阶段概述

根据完全開発仕様書.md的要求，整个开发过程分为三个阶段：

### Phase 1（MVP阶段）- 基础功能
- 目标：实现系统的基本CRUD功能
- 时间预估：2-3周
- 核心功能：主数据管理

### Phase 2（核心功能阶段）- 业务逻辑
- 目标：实现台账管理和计算逻辑
- 时间预估：3-4周
- 核心功能：台账管理、费用明细、自动计算

### Phase 3（完善阶段）- 高级功能
- 目标：完善系统功能和用户体验
- 时间预估：2-3周
- 核心功能：状态管理、PDF输出、数据备份

## 2. Phase 1 - MVP阶段详细计划

### 2.1 开发任务分解

#### 2.1.1 项目初始化（1天）
- [ ] 创建项目目录结构
- [ ] 设置基础HTML文件
- [ ] 配置CSS样式框架（Bootstrap 5）
- [ ] 设置JavaScript模块结构
- [ ] 创建基础配置文件

#### 2.1.2 数据存储模块（2天）
- [ ] 实现localStorage管理类
- [ ] 创建数据模型定义
- [ ] 实现CRUD基础操作
- [ ] 添加数据验证功能
- [ ] 实现数据备份/恢复

**技术实现**：
```javascript
// 核心存储管理器
class StorageManager {
    constructor() {
        this.storageKey = 'ans_accounting_data';
        this.version = '1.0.0';
    }
    
    // 基础CRUD操作
    getAllData() { /* 实现 */ }
    saveData(data) { /* 实现 */ }
    getData(type, id) { /* 实现 */ }
    addData(type, item) { /* 实现 */ }
    updateData(type, id, updates) { /* 实现 */ }
    deleteData(type, id) { /* 实现 */ }
}
```

#### 2.1.3 往来单位管理模块（3天）
- [ ] 创建往来单位列表页面
- [ ] 实现表格组件（显示、排序、分页）
- [ ] 实现新增/编辑表单
- [ ] 添加表单验证
- [ ] 实现删除功能
- [ ] 添加搜索和筛选功能

**界面设计**：
```html
<!-- 往来单位列表页面 -->
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h2>往来单位管理</h2>
            <div class="mb-3">
                <button class="btn btn-primary" onclick="showAddModal()">新增</button>
                <input type="text" class="form-control d-inline-block w-auto ml-2" 
                       placeholder="搜索公司名称" onkeyup="searchData(this.value)">
            </div>
            <div id="data-table"></div>
        </div>
    </div>
</div>
```

#### 2.1.4 费用项目管理模块（2天）
- [ ] 创建费用项目列表页面
- [ ] 实现CRUD功能
- [ ] 添加货币和计量单位选择
- [ ] 实现税区分选择
- [ ] 添加数据验证

#### 2.1.5 支付条件管理模块（2天）
- [ ] 创建支付条件列表页面
- [ ] 实现CRUD功能
- [ ] 实现条件类型选择（締日/天数计算）
- [ ] 添加动态表单显示
- [ ] 实现支付期限计算逻辑

### 2.2 Phase 1 技术难点

#### 2.2.1 动态表单实现
**问题**：支付条件需要根据类型显示不同的输入字段
**解决方案**：
```javascript
function updateFormFields(type) {
    const shimebiGroup = document.getElementById('shimebi-group');
    const tensuuGroup = document.getElementById('tensuu-group');
    
    if (type === '締日') {
        shimebiGroup.style.display = 'block';
        tensuuGroup.style.display = 'none';
    } else if (type === '天数計算') {
        shimebiGroup.style.display = 'none';
        tensuuGroup.style.display = 'block';
    }
}
```

#### 2.2.2 数据关联验证
**问题**：删除数据时需要检查是否被引用
**解决方案**：
```javascript
function checkDataReferences(type, id) {
    const allData = storage.getAllData();
    const references = [];
    
    // 检查台账中是否引用了往来单位
    if (type === 'torihikisaki') {
        allData.daicho.data.forEach(daicho => {
            if (daicho.kokyakuId === id) {
                references.push(`台账: ${daicho.daichoNo}`);
            }
        });
    }
    
    return references;
}
```

### 2.3 Phase 1 测试策略

#### 2.3.1 单元测试
- [ ] 测试数据存储功能
- [ ] 测试表单验证功能
- [ ] 测试编码生成规则
- [ ] 测试数据关联性

#### 2.3.2 集成测试
- [ ] 测试完整的CRUD流程
- [ ] 测试搜索和筛选功能
- [ ] 测试数据导入导出
- [ ] 测试错误处理

## 3. Phase 2 - 核心功能阶段详细计划

### 3.1 开发任务分解

#### 3.1.1 台账管理基础（3天）
- [ ] 创建台账列表页面
- [ ] 实现台账CRUD功能
- [ ] 实现台账编号自动生成
- [ ] 创建台账详情页面框架
- [ ] 实现标签页切换功能

#### 3.1.2 基础海运数据模块（2天）
- [ ] 创建基础数据表单
- [ ] 实现客户选择功能
- [ ] 添加日期选择器
- [ ] 实现表单验证
- [ ] 创建数据保存逻辑

#### 3.1.3 子发票管理模块（3天）
- [ ] 创建子发票列表
- [ ] 实现子发票编号生成
- [ ] 实现子发票CRUD功能
- [ ] 添加结算单位选择
- [ ] 实现支付期限自动计算

**支付期限计算实现**：
```javascript
function calculateShiharaiKigen(seikyuDate, shiharaiJoken) {
    const date = new Date(seikyuDate);
    
    if (shiharaiJoken.kubun === '締日') {
        // 获取下个月的第一天
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        // 设置指定日期
        const targetDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), shiharaiJoken.shimebi);
        return targetDate.toISOString().split('T')[0];
    } else if (shiharaiJoken.kubun === '天数計算') {
        // 添加指定天数
        const targetDate = new Date(date);
        targetDate.setDate(targetDate.getDate() + shiharaiJoken.tensuu);
        return targetDate.toISOString().split('T')[0];
    }
    
    return seikyuDate;
}
```

#### 3.1.4 收费明细模块（3天）
- [ ] 创建可编辑表格组件
- [ ] 实现费用项目选择
- [ ] 实现实时金额计算
- [ ] 添加状态管理功能
- [ ] 实现数据锁定机制

#### 3.1.5 付费明细模块（3天）
- [ ] 创建付费明细表格
- [ ] 实现收费复制功能
- [ ] 实现供应商筛选
- [ ] 添加独立日期设置
- [ ] 实现数据验证

#### 3.1.6 计算引擎模块（2天）
- [ ] 实现单行金额计算
- [ ] 实现汇总统计计算
- [ ] 实现消费税计算
- [ ] 实现毛利计算
- [ ] 添加计算结果验证

**核心计算引擎**：
```javascript
class CalculationEngine {
    // 计算子发票汇总
    calculateInvoiceSummary(koSeikyuId, shuhiData, fuhiData) {
        // 收费汇总
        const shuhiMenzekiGoukei = shuhiData
            .filter(item => item.kubun === '免税')
            .reduce((sum, item) => sum + item.kingaku, 0);
            
        const shuhiKazeiTaiouGoukei = shuhiData
            .filter(item => item.kubun === '課税')
            .reduce((sum, item) => sum + item.kingaku, 0);
            
        const shuhiShouhizei = Math.round(shuhiKazeiTaiouGoukei * 0.1);
        const shuhiGoukei = shuhiMenzekiGoukei + shuhiKazeiTaiouGoukei + shuhiShouhizei;
        
        // 付费汇总（类似计算）
        // ...
        
        // 毛利计算
        const arariZeiNuki = (shuhiMenzekiGoukei + shuhiKazeiTaiouGoukei) - (fuhiMenzekiGoukei + fuhiKazeiTaiouGoukei);
        const arariZeiKomi = shuhiGoukei - fuhiGoukei;
        
        return {
            shuhiMenzekiGoukei,
            shuhiKazeiTaiouGoukei,
            shuhiShouhizei,
            shuhiGoukei,
            // ... 其他汇总数据
            arariZeiNuki,
            arariZeiKomi
        };
    }
}
```

### 3.2 Phase 2 技术难点

#### 3.2.1 复杂表格编辑
**问题**：需要支持实时编辑、计算、状态管理
**解决方案**：
```javascript
class EditableTable {
    constructor(containerId, options) {
        this.container = document.getElementById(containerId);
        this.options = options;
        this.init();
    }
    
    init() {
        this.render();
        this.bindEvents();
    }
    
    bindEvents() {
        // 实时计算
        this.container.addEventListener('input', (e) => {
            if (e.target.classList.contains('calc-input')) {
                this.calculateRow(e.target.closest('tr'));
            }
        });
        
        // 状态变更
        this.container.addEventListener('change', (e) => {
            if (e.target.classList.contains('status-select')) {
                this.handleStatusChange(e.target);
            }
        });
    }
    
    calculateRow(row) {
        const tanka = parseFloat(row.querySelector('[name="tanka"]').value) || 0;
        const suuryou = parseFloat(row.querySelector('[name="suuryou"]').value) || 0;
        const rate = parseFloat(row.querySelector('[name="rate"]').value) || 1;
        
        const kingaku = Math.round(tanka * suuryou * rate);
        row.querySelector('[name="kingaku"]').value = kingaku;
        
        // 触发汇总更新
        this.updateSummary();
    }
}
```

#### 3.2.2 数据状态同步
**问题**：多个子发票间的数据需要同步更新
**解决方案**：
```javascript
// 使用观察者模式实现数据同步
class DataSync {
    constructor() {
        this.observers = [];
    }
    
    subscribe(observer) {
        this.observers.push(observer);
    }
    
    notify(data) {
        this.observers.forEach(observer => {
            observer.update(data);
        });
    }
}

// 在表格组件中使用
const dataSync = new DataSync();
dataSync.subscribe({
    update: (data) => {
        // 更新汇总显示
        updateSummaryDisplay(data);
    }
});
```

### 3.3 Phase 2 测试策略

#### 3.3.1 计算逻辑测试
- [ ] 测试单行金额计算
- [ ] 测试汇总统计计算
- [ ] 测试消费税计算（四舍五入）
- [ ] 测试毛利计算
- [ ] 测试边界情况处理

#### 3.3.2 业务流程测试
- [ ] 测试完整台账创建流程
- [ ] 测试子发票创建流程
- [ ] 测试费用明细录入流程
- [ ] 测试状态变更流程
- [ ] 测试数据锁定机制

#### 3.3.3 性能测试
- [ ] 测试大数据量表格渲染性能
- [ ] 测试实时计算性能
- [ ] 测试数据加载性能
- [ ] 测试内存使用情况

## 4. Phase 3 - 完善阶段详细计划

### 4.1 开发任务分解

#### 4.1.1 状态管理优化（2天）
- [ ] 完善状态流转逻辑
- [ ] 实现状态回退功能
- [ ] 添加状态变更日志
- [ ] 实现权限控制基础
- [ ] 添加状态变更确认

#### 4.1.2 PDF输出功能（3天）
- [ ] 集成jsPDF库
- [ ] 设计PDF模板
- [ ] 实现HTML到PDF转换
- [ ] 添加公司信息配置
- [ ] 实现PDF下载功能

**PDF生成实现**：
```javascript
class PDFGenerator {
    constructor() {
        this.companyInfo = {
            name: "アンササプライチェーン株式会社",
            address: "神奈川県横浜市中区尾上町4-54 KANNAI EX 4F",
            postalCode: "〒231-0015",
            registrationNo: "T5020001157840",
            bankInfo: {
                bankName: "三井住友銀行",
                branchName: "横浜支店",
                accountType: "普通",
                accountNumber: "7665574"
            }
        };
    }
    
    generateInvoice(koSeikyuData) {
        const doc = new jsPDF();
        
        // 设置字体
        doc.setFont("helvetica");
        
        // 添加标题
        doc.setFontSize(20);
        doc.text("請 求 書", 105, 20, { align: "center" });
        
        // 添加公司信息
        this.addCompanyInfo(doc);
        
        // 添加客户信息
        this.addCustomerInfo(doc, koSeikyuData);
        
        // 添加费用明细表格
        this.addInvoiceDetails(doc, koSeikyuData);
        
        // 添加汇总信息
        this.addSummary(doc, koSeikyuData);
        
        // 保存PDF
        doc.save(`請求書_${koSeikyuData.seikyuNo}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    addCompanyInfo(doc) {
        doc.setFontSize(10);
        doc.text(this.companyInfo.name, 20, 40);
        doc.text(this.companyInfo.postalCode, 20, 45);
        doc.text(this.companyInfo.address, 20, 50);
        doc.text(`登録番号：${this.companyInfo.registrationNo}`, 20, 55);
        
        // 银行信息
        doc.text("振込先：", 20, 65);
        doc.text(`${this.companyInfo.bankInfo.bankName} ${this.companyInfo.bankInfo.branchName}`, 20, 70);
        doc.text(`${this.companyInfo.bankInfo.accountType} ${this.companyInfo.bankInfo.accountNumber}`, 20, 75);
    }
}
```

#### 4.1.3 数据备份增强（2天）
- [ ] 实现自动备份功能
- [ ] 添加备份历史管理
- [ ] 实现数据压缩
- [ ] 添加备份加密（可选）
- [ ] 实现备份恢复验证

#### 4.1.4 用户界面优化（2天）
- [ ] 优化响应式设计
- [ ] 添加加载动画
- [ ] 实现错误提示优化
- [ ] 添加操作确认对话框
- [ ] 优化表格显示效果

#### 4.1.5 性能优化（2天）
- [ ] 实现数据缓存机制
- [ ] 优化大数据量表格渲染
- [ ] 实现虚拟滚动（可选）
- [ ] 优化计算性能
- [ ] 添加内存管理

### 4.2 Phase 3 技术难点

#### 4.2.1 PDF布局控制
**问题**：需要精确控制PDF的布局和格式
**解决方案**：
```javascript
// 使用html2canvas + jsPDF实现更好的PDF生成
async function generatePDFWithHTML(elementId) {
    const element = document.getElementById(elementId);
    
    // 使用html2canvas将HTML转换为图片
    const canvas = await html2canvas(element, {
        scale: 2, // 提高清晰度
        useCORS: true,
        allowTaint: true
    });
    
    // 创建PDF
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // 计算图片尺寸
    const imgWidth = 210; // A4宽度
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // 添加图片到PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // 保存PDF
    pdf.save(`invoice_${Date.now()}.pdf`);
}
```

#### 4.2.2 大数据量性能优化
**问题**：数据量大时表格渲染性能下降
**解决方案**：
```javascript
// 实现虚拟滚动
class VirtualScrollTable {
    constructor(containerId, options) {
        this.container = document.getElementById(containerId);
        this.options = options;
        this.scrollTop = 0;
        this.startIndex = 0;
        this.visibleRows = 20;
        this.init();
    }
    
    render() {
        const totalHeight = this.options.data.length * this.options.rowHeight;
        const visibleHeight = this.visibleRows * this.options.rowHeight;
        
        this.container.innerHTML = `
            <div class="virtual-scroll-container" 
                 style="height: ${visibleHeight}px; overflow-y: auto;"
                 onscroll="this.handleScroll(event)">
                <div class="virtual-scroll-spacer" style="height: ${totalHeight}px;">
                    <div class="virtual-scroll-content" 
                         style="transform: translateY(${this.scrollTop}px);">
                        ${this.renderVisibleRows()}
                    </div>
                </div>
            </div>
        `;
    }
    
    handleScroll(e) {
        this.scrollTop = e.target.scrollTop;
        this.renderVisibleRows();
    }
}
```

### 4.3 Phase 3 测试策略

#### 4.3.1 PDF输出测试
- [ ] 测试PDF布局正确性
- [ ] 测试数据完整性
- [ ] 测试多页PDF生成
- [ ] 测试PDF下载功能
- [ ] 测试不同浏览器的兼容性

#### 4.3.2 性能测试
- [ ] 测试大数据量加载性能
- [ ] 测试PDF生成性能
- [ ] 测试内存使用情况
- [ ] 测试响应速度
- [ ] 测试并发操作

#### 4.3.3 用户体验测试
- [ ] 测试界面响应性
- [ ] 测试操作流畅性
- [ ] 测试错误提示友好性
- [ ] 测试帮助文档完整性
- [ ] 测试跨浏览器兼容性

## 5. 开发环境和工具配置

### 5.1 开发环境要求
```json
{
  "node": ">=14.0.0",
  "npm": ">=6.0.0",
  "browsers": [
    "Chrome >= 90",
    "Firefox >= 88",
    "Safari >= 14",
    "Edge >= 90"
  ]
}
```

### 5.2 开发工具配置

#### 5.2.1 VS Code配置
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.live-server"
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }
}
```

#### 5.2.2 项目依赖管理
```json
{
  "dependencies": {
    "bootstrap": "^5.3.0",
    "bootstrap-icons": "^1.10.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1"
  },
  "devDependencies": {
    "vite": "^4.0.0",
    "eslint": "^8.0.0",
    "prettier": "^2.8.0"
  }
}
```

## 6. 代码规范和最佳实践

### 6.1 命名规范
```javascript
// 变量命名 - 使用驼峰命名法
let customerName = "";
let invoiceTotal = 0;

// 函数命名 - 使用动词开头
function calculateTax() { }
function generateInvoice() { }

// 类命名 - 使用帕斯卡命名法
class InvoiceManager { }
class DataValidator { }

// 常量命名 - 使用大写和下划线
const TAX_RATE = 0.1;
const COMPANY_NAME = "アンササプライチェーン株式会社";
```

### 6.2 代码结构规范
```javascript
// 模块化结构
export class ModuleName {
    constructor(options) {
        this.options = options;
        this.init();
    }
    
    init() {
        // 初始化逻辑
    }
    
    // 公共方法
    publicMethod() {
        // 实现代码
    }
    
    // 私有方法
    _privateMethod() {
        // 实现代码
    }
}
```

### 6.3 错误处理规范
```javascript
// 统一的错误处理
try {
    const result = calculateInvoice(data);
    return result;
} catch (error) {
    console.error('计算发票失败:', error);
    errorHandler.addError('calculation', '发票计算失败', error.message);
    throw new Error('发票计算失败，请检查输入数据');
}
```

## 7. 部署和发布计划

### 7.1 部署准备
- [ ] 代码压缩和优化
- [ ] 依赖库打包
- [ ] 测试环境部署
- [ ] 生产环境配置
- [ ] 用户文档准备

### 7.2 发布检查清单
- [ ] 所有功能测试通过
- [ ] 跨浏览器兼容性测试
- [ ] 性能测试完成
- [ ] 安全测试完成
- [ ] 用户文档完整
- [ ] 备份恢复测试
- [ ] 部署文档准备

### 7.3 后续维护计划
- [ ] 定期更新依赖库
- [ ] 收集用户反馈
- [ ] 性能监控和优化
- [ ] 功能迭代计划
- [ ] 技术支持方案

这个开发实施计划提供了详细的开发路线图，包括每个阶段的具体任务、技术实现方案、测试策略和最佳实践。整个计划预计需要7-10周完成，可以根据实际情况进行调整。