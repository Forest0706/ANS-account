/**
 * 基础UI组件模块
 * 提供可重用的UI组件和模态框功能
 */

class BaseComponents {
    constructor() {
        this.modalContainer = document.getElementById('modal-container');
        this.activeModal = null;
    }

    /**
     * 创建模态框
     * @param {object} options - 模态框配置
     * @returns {HTMLElement} 模态框元素
     */
    createModal(options = {}) {
        const {
            title = '',
            content = '',
            footer = '',
            size = 'md',
            backdropClose = true,
            keyboardClose = true
        } = options;

        const modal = Utils.dom.createElement('div', {
            className: 'modal',
            dataset: { size }
        });

        const modalContent = Utils.dom.createElement('div', {
            className: 'modal-content'
        });

        // 头部
        const header = Utils.dom.createElement('div', {
            className: 'modal-header'
        }, [
            Utils.dom.createElement('h3', {}, title),
            Utils.dom.createElement('button', {
                className: 'modal-close',
                type: 'button',
                onclick: () => this.closeModal(modal)
            }, '<i class="fas fa-times"></i>')
        ]);

        // 内容
        const body = Utils.dom.createElement('div', {
            className: 'modal-body'
        }, content);

        // 底部
        const modalFooter = Utils.dom.createElement('div', {
            className: 'modal-footer'
        }, footer);

        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);

        // 事件监听
        if (backdropClose) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        }

        if (keyboardClose) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.activeModal === modal) {
                    this.closeModal(modal);
                }
            });
        }

        return modal;
    }

    /**
     * 显示模态框
     * @param {HTMLElement} modal - 模态框元素
     */
    showModal(modal) {
        this.modalContainer.appendChild(modal);
        
        // 使用setTimeout确保CSS过渡效果
        setTimeout(() => {
            modal.classList.add('active');
            this.activeModal = modal;
        }, 10);
    }

    /**
     * 关闭模态框
     * @param {HTMLElement} modal - 模态框元素
     */
    closeModal(modal) {
        modal.classList.remove('active');
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            if (this.activeModal === modal) {
                this.activeModal = null;
            }
        }, 300);
    }

    /**
     * 创建表单输入框
     * @param {object} options - 输入框配置
     * @returns {HTMLElement} 输入框容器
     */
    createFormInput(options = {}) {
        const {
            name = '',
            label = '',
            type = 'text',
            value = '',
            placeholder = '',
            required = false,
            disabled = false,
            error = '',
            onChange = null,
            onBlur = null
        } = options;

        const group = Utils.dom.createElement('div', {
            className: 'form-group'
        });

        const labelElement = Utils.dom.createElement('label', {
            className: 'form-label',
            for: name
        }, `${label}${required ? ' *' : ''}`);

        const input = Utils.dom.createElement('input', {
            className: `form-control ${error ? 'error' : ''}`,
            type,
            id: name,
            name,
            value,
            placeholder,
            required,
            disabled,
            onchange: onChange,
            onblur: onBlur
        });

        const errorElement = Utils.dom.createElement('div', {
            className: 'form-error'
        }, error);

        group.appendChild(labelElement);
        group.appendChild(input);
        group.appendChild(errorElement);

        return group;
    }

    /**
     * 创建表单选择框
     * @param {object} options - 选择框配置
     * @returns {HTMLElement} 选择框容器
     */
    createFormSelect(options = {}) {
        const {
            name = '',
            label = '',
            value = '',
            options: selectOptions = [],
            required = false,
            disabled = false,
            error = '',
            onChange = null
        } = options;

        const group = Utils.dom.createElement('div', {
            className: 'form-group'
        });

        const labelElement = Utils.dom.createElement('label', {
            className: 'form-label',
            for: name
        }, `${label}${required ? ' *' : ''}`);

        const select = Utils.dom.createElement('select', {
            className: `form-select ${error ? 'error' : ''}`,
            id: name,
            name,
            required,
            disabled,
            onchange: onChange
        });

        // 添加默认选项
        const defaultOption = Utils.dom.createElement('option', {
            value: ''
        }, '请选择...');
        select.appendChild(defaultOption);

        // 添加选项
        selectOptions.forEach(option => {
            const optionElement = Utils.dom.createElement('option', {
                value: option.value,
                selected: option.value === value
            }, option.text);
            select.appendChild(optionElement);
        });

        const errorElement = Utils.dom.createElement('div', {
            className: 'form-error'
        }, error);

        group.appendChild(labelElement);
        group.appendChild(select);
        group.appendChild(errorElement);

        return group;
    }

    /**
     * 创建表单文本域
     * @param {object} options - 文本域配置
     * @returns {HTMLElement} 文本域容器
     */
    createFormTextarea(options = {}) {
        const {
            name = '',
            label = '',
            value = '',
            placeholder = '',
            rows = 3,
            required = false,
            disabled = false,
            error = '',
            onChange = null
        } = options;

        const group = Utils.dom.createElement('div', {
            className: 'form-group'
        });

        const labelElement = Utils.dom.createElement('label', {
            className: 'form-label',
            for: name
        }, `${label}${required ? ' *' : ''}`);

        const textarea = Utils.dom.createElement('textarea', {
            className: `form-control form-textarea ${error ? 'error' : ''}`,
            id: name,
            name,
            placeholder,
            rows,
            required,
            disabled,
            onchange: onChange
        }, value);

        const errorElement = Utils.dom.createElement('div', {
            className: 'form-error'
        }, error);

        group.appendChild(labelElement);
        group.appendChild(textarea);
        group.appendChild(errorElement);

        return group;
    }

    /**
     * 创建确认对话框
     * @param {object} options - 对话框配置
     * @returns {Promise} 用户选择结果
     */
    createConfirmDialog(options = {}) {
        const {
            title = '确认操作',
            message = '您确定要执行此操作吗？',
            confirmText = '确定',
            cancelText = '取消',
            confirmClass = 'btn-danger',
            cancelClass = 'btn-secondary'
        } = options;

        return new Promise((resolve) => {
            const content = Utils.dom.createElement('div', {}, message);

            const footer = Utils.dom.createElement('div', {}, [
                Utils.dom.createElement('button', {
                    className: `btn ${cancelClass}`,
                    onclick: () => {
                        this.closeModal(modal);
                        resolve(false);
                    }
                }, cancelText),
                Utils.dom.createElement('button', {
                    className: `btn ${confirmClass}`,
                    onclick: () => {
                        this.closeModal(modal);
                        resolve(true);
                    }
                }, confirmText)
            ]);

            const modal = this.createModal({
                title,
                content,
                footer,
                backdropClose: true,
                keyboardClose: true
            });

            this.showModal(modal);
        });
    }

    /**
     * 创建提示消息
     * @param {object} options - 消息配置
     */
    createToast(options = {}) {
        const {
            message = '',
            type = 'info', // success, warning, error, info
            duration = 3000,
            position = 'top-right'
        } = options;

        const toast = Utils.dom.createElement('div', {
            className: `toast toast-${type}`,
            style: `
                position: fixed;
                ${position.includes('top') ? 'top: 20px' : 'bottom: 20px'};
                ${position.includes('right') ? 'right: 20px' : 'left: 20px'};
                background: var(--white);
                color: var(--gray-700);
                padding: 1rem 1.5rem;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                border-left: 4px solid var(--${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'error' ? 'danger' : 'info'}-color);
                z-index: 2000;
                transform: translateX(${position.includes('right') ? '100%' : '-100%'});
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                max-width: 400px;
            `
        }, [
            Utils.dom.createElement('i', {
                className: `fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}`
            }),
            Utils.dom.createElement('span', {}, message)
        ]);

        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            toast.style.transform = `translateX(${position.includes('right') ? '100%' : '-100%'})`;
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * 创建表格
     * @param {object} options - 表格配置
     * @returns {HTMLElement} 表格元素
     */
    createTable(options = {}) {
        const {
            columns = [],
            data = [],
            sortable = true,
            searchable = true,
            actions = []
        } = options;

        const table = Utils.dom.createElement('table', {
            className: 'data-table'
        });

        // 表头
        const thead = Utils.dom.createElement('thead');
        const headerRow = Utils.dom.createElement('tr');

        columns.forEach(column => {
            const th = Utils.dom.createElement('th', {
                dataset: { sort: column.key },
                onclick: sortable ? () => this.handleSort(column.key) : null
            }, [
                column.label,
                sortable ? Utils.dom.createElement('i', {
                    className: 'fas fa-sort',
                    style: 'margin-left: 0.5rem;'
                }) : ''
            ]);
            headerRow.appendChild(th);
        });

        if (actions.length > 0) {
            const actionTh = Utils.dom.createElement('th', {}, '操作');
            headerRow.appendChild(actionTh);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // 表体
        const tbody = Utils.dom.createElement('tbody');
        data.forEach(row => {
            const tr = Utils.dom.createElement('tr');
            
            columns.forEach(column => {
                const value = row[column.key];
                const formattedValue = column.formatter ? column.formatter(value, row) : value;
                const td = Utils.dom.createElement('td', {}, formattedValue);
                tr.appendChild(td);
            });

            if (actions.length > 0) {
                const actionTd = Utils.dom.createElement('td', {});
                actions.forEach(action => {
                    const button = Utils.dom.createElement('button', {
                        className: `btn btn-sm ${action.className || 'btn-secondary'}`,
                        onclick: () => action.handler(row),
                        style: 'margin-right: 0.5rem;'
                    }, action.label);
                    actionTd.appendChild(button);
                });
                tr.appendChild(actionTd);
            }

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        return table;
    }

    /**
     * 创建分页组件
     * @param {object} options - 分页配置
     * @returns {HTMLElement} 分页元素
     */
    createPagination(options = {}) {
        const {
            currentPage = 1,
            totalPages = 1,
            totalItems = 0,
            pageSize = 10,
            onPageChange = null
        } = options;

        const pagination = Utils.dom.createElement('div', {
            className: 'pagination',
            style: 'display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 1rem;'
        });

        // 上一页
        const prevButton = Utils.dom.createElement('button', {
            className: 'btn btn-sm btn-secondary',
            onclick: () => currentPage > 1 && onPageChange && onPageChange(currentPage - 1),
            disabled: currentPage <= 1
        }, '上一页');
        pagination.appendChild(prevButton);

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                const pageButton = Utils.dom.createElement('button', {
                    className: `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}`,
                    onclick: () => onPageChange && onPageChange(i)
                }, i.toString());
                pagination.appendChild(pageButton);
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                const dots = Utils.dom.createElement('span', {
                    style: 'padding: 0 0.5rem;'
                }, '...');
                pagination.appendChild(dots);
            }
        }

        // 下一页
        const nextButton = Utils.dom.createElement('button', {
            className: 'btn btn-sm btn-secondary',
            onclick: () => currentPage < totalPages && onPageChange && onPageChange(currentPage + 1),
            disabled: currentPage >= totalPages
        }, '下一页');
        pagination.appendChild(nextButton);

        // 统计信息
        const info = Utils.dom.createElement('span', {
            style: 'margin-left: 1rem; color: var(--gray-600); font-size: var(--text-sm);'
        }, `共 ${totalItems} 条记录`);
        pagination.appendChild(info);

        return pagination;
    }
}

// 创建全局组件管理器实例
window.Components = new BaseComponents();