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
        const modal = this.createCustomerModal('取引先新規作成', {});
        Components.showModal(modal);
    }

    /**
     * 显示编辑模态框
     */
    showEditModal(customer) {
        const modal = this.createCustomerModal('取引先編集', customer);
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
            label: 'コード',
            value: newCode,
            required: true,
            disabled: true
        });

        // 名称
        const nameInput = Components.createFormInput({
            name: 'name',
            label: '会社名',
            value: customer.name || '',
            placeholder: '取引先名を入力してください',
            required: true
        });

        // 类型
        const typeSelect = Components.createFormSelect({
            name: 'type',
            label: '取引先区分',
            value: customer.type || 'customer',
            options: [
                { value: 'customer', text: '顧客' },
                { value: 'supplier', text: '仕入先' },
                { value: 'both', text: '顧客/仕入先' }
            ],
            required: true
        });

        // 联系人
        const contactInput = Components.createFormInput({
            name: 'contact_person',
            label: '担当者',
            value: customer.contact_person || '',
            placeholder: '担当者名を入力してください'
        });

        // 电话
        const phoneInput = Components.createFormInput({
            name: 'phone',
            label: '電話番号',
            value: customer.phone || '',
            placeholder: '電話番号を入力してください'
        });

        // 邮箱
        const emailInput = Components.createFormInput({
            name: 'email',
            label: 'メール',
            value: customer.email || '',
            placeholder: 'メールアドレスを入力してください'
        });

        // 地址
        const addressInput = Components.createFormTextarea({
            name: 'address',
            label: '住所',
            value: customer.address || '',
            placeholder: '住所を入力してください'
        });

        // 备注
        const notesInput = Components.createFormTextarea({
            name: 'notes',
            label: '備考',
            value: customer.notes || '',
            placeholder: '備考を入力してください'
        });

        // 状态
        const statusSelect = Components.createFormSelect({
            name: 'status',
            label: '状態',
            value: customer.status || 'active',
            options: [
                { value: 'active', text: '有効' },
                { value: 'inactive', text: '無効' }
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
            }, 'キャンセル'),
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
                message: isEdit ? '取引先を更新しました！' : '取引先を追加しました！',
                type: 'success'
            });
            
            this.loadCustomers();
            this.filterAndSort();
            Components.closeModal(document.querySelector('.modal.active'));
        } else {
            Components.createToast({
                message: '操作に失敗しました。再試行してください',
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
            title: '削除確認',
            message: `取引先 "${customer.name}" を削除してもよろしいですか？`,
            confirmText: '削除',
            confirmClass: 'btn-danger'
        });

        if (confirmed) {
            const success = this.storage.deleteItem(
                this.storage.STORAGE_KEYS.CUSTOMERS,
                customerId
            );

            if (success) {
                Components.createToast({
                    message: '取引先を削除しました！',
                    type: 'success'
                });
                
                this.loadCustomers();
                this.filterAndSort();
            } else {
                Components.createToast({
                    message: '削除に失敗しました。再試行してください',
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
            }, 'データがありません');
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
                'customer': '顧客',
                'supplier': '仕入先',
                'both': '顧客/仕入先'
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