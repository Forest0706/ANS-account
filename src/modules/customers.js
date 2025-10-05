/**
 * 往来单位管理模块
 * 提供往来单位的CRUD功能和搜索筛选
 */

class CustomerManager {
    constructor() {
        this.storage = window.storage;
        this.customers = [];
        this.filteredCustomers = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.sortBy = 'code';
        this.sortOrder = 'asc';
        this.searchTerm = '';
        
        this.init();
    }

    /**
     * 初始化模块
     */
    init() {
        this.loadCustomers();
        this.bindEvents();
        this.renderTable();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 新增按钮
        document.getElementById('add-customer-btn').addEventListener('click', () => {
            this.showAddModal();
        });

        // 搜索框
        const searchInput = document.getElementById('customer-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.filterAndSort();
            }, 300));
        }

        // 表格排序
        document.querySelectorAll('#customers-table th[data-sort]').forEach(th => {
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
     * 加载往来单位数据
     */
    loadCustomers() {
        this.customers = this.storage.get(this.storage.STORAGE_KEYS.CUSTOMERS) || [];
        this.filteredCustomers = [...this.customers];
    }

    /**
     * 显示新增模态框
     */
    showAddModal() {
        const modal = this.createCustomerModal('新增往来单位', {});
        Components.showModal(modal);
    }

    /**
     * 显示编辑模态框
     */
    showEditModal(customer) {
        const modal = this.createCustomerModal('编辑往来单位', customer);
        Components.showModal(modal);
    }

    /**
     * 创建往来单位模态框
     */
    createCustomerModal(title, customer = {}) {
        const isEdit = !!customer.id;
        const formId = 'customer-form';
        
        // 生成新代码（仅在新增时）
        const newCode = isEdit ? customer.code : this.storage.getNextCode('customer');

        const formContent = Utils.dom.createElement('form', {
            id: formId,
            dataset: { customerId: customer.id || '' }
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
            label: '名称',
            value: customer.name || '',
            placeholder: '请输入往来单位名称',
            required: true
        });

        // 类型
        const typeSelect = Components.createFormSelect({
            name: 'type',
            label: '类型',
            value: customer.type || 'customer',
            options: [
                { value: 'customer', text: '客户' },
                { value: 'supplier', text: '供应商' },
                { value: 'both', text: '客户/供应商' }
            ],
            required: true
        });

        // 联系人
        const contactInput = Components.createFormInput({
            name: 'contact_person',
            label: '联系人',
            value: customer.contact_person || '',
            placeholder: '请输入联系人姓名'
        });

        // 电话
        const phoneInput = Components.createFormInput({
            name: 'phone',
            label: '电话',
            value: customer.phone || '',
            placeholder: '请输入联系电话'
        });

        // 邮箱
        const emailInput = Components.createFormInput({
            name: 'email',
            label: '邮箱',
            value: customer.email || '',
            placeholder: '请输入邮箱地址'
        });

        // 地址
        const addressInput = Components.createFormTextarea({
            name: 'address',
            label: '地址',
            value: customer.address || '',
            placeholder: '请输入详细地址'
        });

        // 备注
        const notesInput = Components.createFormTextarea({
            name: 'notes',
            label: '备注',
            value: customer.notes || '',
            placeholder: '请输入备注信息'
        });

        // 状态
        const statusSelect = Components.createFormSelect({
            name: 'status',
            label: '状态',
            value: customer.status || 'active',
            options: [
                { value: 'active', text: '启用' },
                { value: 'inactive', text: '停用' }
            ]
        });

        formContent.appendChild(codeInput);
        formContent.appendChild(nameInput);
        formContent.appendChild(typeSelect);
        formContent.appendChild(contactInput);
        formContent.appendChild(phoneInput);
        formContent.appendChild(emailInput);
        formContent.appendChild(addressInput);
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
                    this.handleCustomerSubmit(formId, isEdit);
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
    handleCustomerSubmit(formId, isEdit) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const customerData = Object.fromEntries(formData.entries());
        
        // 验证表单数据
        const validation = this.validateCustomerData(customerData);
        if (!validation.isValid) {
            this.showFormErrors(form, validation.errors);
            return;
        }

        // 保存数据
        let result;
        if (isEdit) {
            result = this.storage.updateItem(
                this.storage.STORAGE_KEYS.CUSTOMERS,
                customerData.id,
                customerData
            );
        } else {
            result = this.storage.addItem(
                this.storage.STORAGE_KEYS.CUSTOMERS,
                customerData
            );
        }

        if (result) {
            Components.createToast({
                message: isEdit ? '往来单位更新成功！' : '往来单位添加成功！',
                type: 'success'
            });
            
            this.loadCustomers();
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
     * 验证往来单位数据
     */
    validateCustomerData(data) {
        const rules = {
            name: ['required'],
            type: ['required'],
            email: [{ type: 'email', required: false }],
            phone: [{ type: 'phone', required: false }]
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
     * 删除往来单位
     */
    async deleteCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        const confirmed = await Components.createConfirmDialog({
            title: '删除确认',
            message: `确定要删除往来单位 "${customer.name}" 吗？`,
            confirmText: '删除',
            confirmClass: 'btn-danger'
        });

        if (confirmed) {
            const success = this.storage.deleteItem(
                this.storage.STORAGE_KEYS.CUSTOMERS,
                customerId
            );

            if (success) {
                Components.createToast({
                    message: '往来单位删除成功！',
                    type: 'success'
                });
                
                this.loadCustomers();
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
     * 搜索、筛选和排序
     */
    filterAndSort() {
        let filtered = [...this.customers];

        // 搜索
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(customer => 
                customer.name.toLowerCase().includes(searchLower) ||
                customer.code.toLowerCase().includes(searchLower) ||
                (customer.contact_person && customer.contact_person.toLowerCase().includes(searchLower))
            );
        }

        // 排序
        filtered = Utils.array.sortBy(filtered, this.sortBy, this.sortOrder);

        this.filteredCustomers = filtered;
        this.renderTable();
    }

    /**
     * 渲染表格
     */
    renderTable() {
        const tbody = document.getElementById('customers-tbody');
        if (!tbody) return;

        // 分页
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredCustomers.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (pageData.length === 0) {
            const emptyRow = Utils.dom.createElement('tr');
            const emptyCell = Utils.dom.createElement('td', {
                colspan: 5,
                style: 'text-align: center; padding: 2rem; color: var(--gray-500);'
            }, '暂无数据');
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
            return;
        }

        pageData.forEach(customer => {
            const row = Utils.dom.createElement('tr');

            // 代码
            const codeCell = Utils.dom.createElement('td', {}, customer.code);
            row.appendChild(codeCell);

            // 名称
            const nameCell = Utils.dom.createElement('td', {}, customer.name);
            row.appendChild(nameCell);

            // 类型
            const typeText = {
                'customer': '客户',
                'supplier': '供应商',
                'both': '客户/供应商'
            }[customer.type] || customer.type;
            const typeCell = Utils.dom.createElement('td', {}, typeText);
            row.appendChild(typeCell);

            // 联系方式
            const contactCell = Utils.dom.createElement('td', {}, 
                `${customer.contact_person || ''}${customer.phone ? ` (${customer.phone})` : ''}`
            );
            row.appendChild(contactCell);

            // 操作
            const actionCell = Utils.dom.createElement('td', {});
            
            const editButton = Utils.dom.createElement('button', {
                className: 'btn btn-sm btn-primary',
                onclick: () => this.showEditModal(customer),
                style: 'margin-right: 0.5rem;'
            }, '<i class="fas fa-edit"></i>');

            const deleteButton = Utils.dom.createElement('button', {
                className: 'btn btn-sm btn-danger',
                onclick: () => this.deleteCustomer(customer.id)
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
        document.querySelectorAll('#customers-table th[data-sort]').forEach(th => {
            const sortIcon = th.querySelector('i');
            if (th.dataset.sort === this.sortBy) {
                sortIcon.className = `fas fa-sort-${this.sortOrder === 'asc' ? 'up' : 'down'}`;
            } else {
                sortIcon.className = 'fas fa-sort';
            }
        });
    }
}

// 初始化往来单位管理器
window.CustomerManager = CustomerManager;