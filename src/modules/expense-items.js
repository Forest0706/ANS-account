/**
 * 费用项目主数据管理模块
 * 提供费用项目的CRUD功能、税区分管理和多币种支持
 */

class ExpenseItemManager {
    constructor() {
        this.storage = window.storage;
        this.expenseItems = [];
        this.filteredItems = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.sortBy = 'code';
        this.sortOrder = 'asc';
        this.searchTerm = '';
        
        // 支持的币种
        this.currencies = [
            { code: 'CNY', name: '人民币', symbol: '¥' },
            { code: 'USD', name: '美元', symbol: '$' },
            { code: 'EUR', name: '欧元', symbol: '€' },
            { code: 'JPY', name: '日元', symbol: '¥' },
            { code: 'HKD', name: '港币', symbol: 'HK$' }
        ];

        // 税区分
        this.taxTypes = [
            { value: 'taxable', text: '課税', rate: 0.13 }, // 13%税率
            { value: 'exempt', text: '免税', rate: 0 },
            { value: 'zero_rate', text: '零税率', rate: 0 },
            { value: 'reduced_rate', text: '减税', rate: 0.09 } // 9%税率
        ];

        this.init();
    }

    /**
     * 初始化模块
     */
    init() {
        this.loadExpenseItems();
        this.bindEvents();
        this.renderTable();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 新增按钮
        document.getElementById('add-expense-item-btn').addEventListener('click', () => {
            this.showAddModal();
        });

        // 搜索框
        const searchInput = document.getElementById('expense-item-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.filterAndSort();
            }, 300));
        }

        // 表格排序
        document.querySelectorAll('#expense-items-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const sortKey = th.dataset.sort;
                if (this.sortBy === sortKey) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = sortKey;
                    this.sortOrder = 'asc';
                }
                this.filterAndSort();
            });
        });
    }

    /**
     * 加载费用项目数据
     */
    loadExpenseItems() {
        this.expenseItems = this.storage.get(this.storage.STORAGE_KEYS.EXPENSE_ITEMS) || [];
        this.filteredItems = [...this.expenseItems];
    }

    /**
     * 显示新增模态框
     */
    showAddModal() {
        const modal = this.createExpenseItemModal('新增费用项目', {});
        Components.showModal(modal);
    }

    /**
     * 显示编辑模态框
     */
    showEditModal(item) {
        const modal = this.createExpenseItemModal('编辑费用项目', item);
        Components.showModal(modal);
    }

    /**
     * 创建费用项目模态框
     */
    createExpenseItemModal(title, item = {}) {
        const isEdit = !!item.id;
        const formId = 'expense-item-form';
        
        // 生成新代码（仅在新增时）
        const newCode = isEdit ? item.code : this.storage.getNextCode('expense_item');

        const formContent = Utils.dom.createElement('form', {
            id: formId,
            dataset: { itemId: item.id || '' }
        });

        // 代码（只读）
        const codeInput = Components.createFormInput({
            name: 'code',
            label: '代码',
            value: newCode,
            required: true,
            disabled: true
        });

        // 名称
        const nameInput = Components.createFormInput({
            name: 'name',
            label: '费用项目名称',
            value: item.name || '',
            placeholder: '请输入费用项目名称',
            required: true
        });

        // 分类
        const categorySelect = Components.createFormSelect({
            name: 'category',
            label: '费用分类',
            value: item.category || 'transport',
            options: [
                { value: 'transport', text: '运输费' },
                { value: 'storage', text: '仓储费' },
                { value: 'handling', text: '装卸费' },
                { value: 'packaging', text: '包装费' },
                { value: 'insurance', text: '保险费' },
                { value: 'customs', text: '报关费' },
                { value: 'commission', text: '佣金' },
                { value: 'other', text: '其他费用' }
            ],
            required: true
        });

        // 税区分
        const taxTypeSelect = Components.createFormSelect({
            name: 'tax_type',
            label: '税区分',
            value: item.tax_type || 'taxable',
            options: this.taxTypes.map(tax => ({
                value: tax.value,
                text: tax.text
            })),
            required: true
        });

        // 默认币种
        const currencySelect = Components.createFormSelect({
            name: 'default_currency',
            label: '默认币种',
            value: item.default_currency || 'CNY',
            options: this.currencies.map(currency => ({
                value: currency.code,
                text: `${currency.code} - ${currency.name}`
            })),
            required: true
        });

        // 默认单价
        const defaultPriceInput = Components.createFormInput({
            name: 'default_price',
            label: '默认单价',
            value: item.default_price || '',
            type: 'number',
            step: '0.01',
            placeholder: '请输入默认单价'
        });

        // 计量单位
        const unitInput = Components.createFormInput({
            name: 'unit',
            label: '计量单位',
            value: item.unit || '',
            placeholder: '如：吨、立方米、件等'
        });

        // 备注
        const notesInput = Components.createFormTextarea({
            name: 'notes',
            label: '备注',
            value: item.notes || '',
            placeholder: '请输入备注信息'
        });

        // 状态
        const statusSelect = Components.createFormSelect({
            name: 'status',
            label: '状态',
            value: item.status || 'active',
            options: [
                { value: 'active', text: '启用' },
                { value: 'inactive', text: '停用' }
            ]
        });

        formContent.appendChild(codeInput);
        formContent.appendChild(nameInput);
        formContent.appendChild(categorySelect);
        formContent.appendChild(taxTypeSelect);
        formContent.appendChild(currencySelect);
        formContent.appendChild(defaultPriceInput);
        formContent.appendChild(unitInput);
        formContent.appendChild(notesInput);
        formContent.appendChild(statusSelect);

        const footer = Utils.dom.createElement('div', {}, [
            Utils.dom.createElement('button', {
                type: 'button',
                className: 'btn btn-secondary',
                onclick: () => Components.closeModal(modal)
            }, '取消'),
            Utils.dom.createElement('button', {
                type: 'submit',
                className: 'btn btn-primary',
                onclick: (e) => {
                    e.preventDefault();
                    this.handleExpenseItemSubmit(formId, isEdit);
                }
            }, isEdit ? '更新' : '保存')
        ]);

        const modal = Components.createModal({
            title,
            content: formContent,
            footer
        });

        return modal;
    }

    /**
     * 处理表单提交
     */
    handleExpenseItemSubmit(formId, isEdit) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const itemData = Object.fromEntries(formData.entries());
        
        // 转换数字字段
        if (itemData.default_price) {
            itemData.default_price = parseFloat(itemData.default_price);
        }

        // 验证表单数据
        const validation = this.validateExpenseItemData(itemData);
        if (!validation.isValid) {
            this.showFormErrors(form, validation.errors);
            return;
        }

        // 保存数据
        let result;
        if (isEdit) {
            result = this.storage.updateItem(
                this.storage.STORAGE_KEYS.EXPENSE_ITEMS,
                itemData.id,
                itemData
            );
        } else {
            result = this.storage.addItem(
                this.storage.STORAGE_KEYS.EXPENSE_ITEMS,
                itemData
            );
        }

        if (result) {
            Components.createToast({
                message: isEdit ? '费用项目更新成功！' : '费用项目添加成功！',
                type: 'success'
            });
            
            this.loadExpenseItems();
            this.filterAndSort();
            Components.closeModal(document.querySelector('.modal.active'));
        } else {
            Components.createToast({
                message: '操作失败，请重试',
                type: 'error'
            });
        }
    }

    /**
     * 验证费用项目数据
     */
    validateExpenseItemData(data) {
        const rules = {
            name: ['required'],
            category: ['required'],
            tax_type: ['required'],
            default_currency: ['required'],
            default_price: [{ type: 'number', required: false, min: 0 }]
        };

        return Utils.validator.validate(data, rules);
    }

    /**
     * 显示表单错误
     */
    showFormErrors(form, errors) {
        Object.keys(errors).forEach(fieldName => {
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (input) {
                Utils.dom.showError(input, errors[fieldName]);
            }
        });
    }

    /**
     * 删除费用项目
     */
    async deleteExpenseItem(itemId) {
        const item = this.expenseItems.find(i => i.id === itemId);
        if (!item) return;

        const confirmed = await Components.createConfirmDialog({
            title: '删除确认',
            message: `确定要删除费用项目 "${item.name}" 吗？`,
            confirmText: '删除',
            confirmClass: 'btn-danger'
        });

        if (confirmed) {
            const success = this.storage.deleteItem(
                this.storage.STORAGE_KEYS.EXPENSE_ITEMS,
                itemId
            );

            if (success) {
                Components.createToast({
                    message: '费用项目删除成功！',
                    type: 'success'
                });
                
                this.loadExpenseItems();
                this.filterAndSort();
            } else {
                Components.createToast({
                    message: '删除失败，请重试',
                    type: 'error'
                });
            }
        }
    }

    /**
     * 获取税率
     */
    getTaxRate(taxType) {
        const tax = this.taxTypes.find(t => t.value === taxType);
        return tax ? tax.rate : 0;
    }

    /**
     * 获取币种信息
     */
    getCurrencyInfo(currencyCode) {
        return this.currencies.find(c => c.code === currencyCode) || this.currencies[0];
    }

    /**
     * 计算含税金额
     */
    calculateTaxAmount(amount, taxType) {
        const taxRate = this.getTaxRate(taxType);
        return amount * taxRate;
    }

    /**
     * 搜索、筛选和排序
     */
    filterAndSort() {
        let filtered = [...this.expenseItems];

        // 搜索
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(searchLower) ||
                item.code.toLowerCase().includes(searchLower) ||
                item.category.toLowerCase().includes(searchLower)
            );
        }

        // 排序
        filtered = Utils.array.sortBy(filtered, this.sortBy, this.sortOrder);

        this.filteredItems = filtered;
        this.renderTable();
    }

    /**
     * 渲染表格
     */
    renderTable() {
        const tbody = document.getElementById('expense-items-tbody');
        if (!tbody) return;

        // 分页
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredItems.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (pageData.length === 0) {
            const emptyRow = Utils.dom.createElement('tr');
            const emptyCell = Utils.dom.createElement('td', {
                colspan: 6,
                style: 'text-align: center; padding: 2rem; color: var(--gray-500);'
            }, '暂无数据');
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
            return;
        }

        pageData.forEach(item => {
            const row = Utils.dom.createElement('tr');

            // 代码
            const codeCell = Utils.dom.createElement('td', {}, item.code);
            row.appendChild(codeCell);

            // 名称
            const nameCell = Utils.dom.createElement('td', {}, item.name);
            row.appendChild(nameCell);

            // 分类
            const categoryText = {
                'transport': '运输费',
                'storage': '仓储费',
                'handling': '装卸费',
                'packaging': '包装费',
                'insurance': '保险费',
                'customs': '报关费',
                'commission': '佣金',
                'other': '其他费用'
            }[item.category] || item.category;
            const categoryCell = Utils.dom.createElement('td', {}, categoryText);
            row.appendChild(categoryCell);

            // 税区分
            const taxTypeText = this.taxTypes.find(t => t.value === item.tax_type)?.text || item.tax_type;
            const taxCell = Utils.dom.createElement('td', {}, taxTypeText);
            row.appendChild(taxCell);

            // 默认币种和价格
            const currencyInfo = this.getCurrencyInfo(item.default_currency);
            const priceText = item.default_price ? 
                `${currencyInfo.symbol}${Utils.number.format(item.default_price)}` : '-';
            const priceCell = Utils.dom.createElement('td', {}, priceText);
            row.appendChild(priceCell);

            // 操作
            const actionCell = Utils.dom.createElement('td', {});
            
            const editButton = Utils.dom.createElement('button', {
                className: 'btn btn-sm btn-primary',
                onclick: () => this.showEditModal(item),
                style: 'margin-right: 0.5rem;'
            }, '<i class="fas fa-edit"></i>');

            const deleteButton = Utils.dom.createElement('button', {
                className: 'btn btn-sm btn-danger',
                onclick: () => this.deleteExpenseItem(item.id)
            }, '<i class="fas fa-trash"></i>');

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            tbody.appendChild(row);
        });

        // 更新排序图标
        this.updateSortIcons();
    }

    /**
     * 更新排序图标
     */
    updateSortIcons() {
        document.querySelectorAll('#expense-items-table th[data-sort]').forEach(th => {
            const sortIcon = th.querySelector('i');
            if (th.dataset.sort === this.sortBy) {
                sortIcon.className = `fas fa-sort-${this.sortOrder === 'asc' ? 'up' : 'down'}`;
            } else {
                sortIcon.className = 'fas fa-sort';
            }
        });
    }
}

// 初始化费用项目管理器
window.ExpenseItemManager = ExpenseItemManager;