/**
 * 数据存储模块
 * 提供localStorage数据操作的基础功能
 */

class StorageManager {
    constructor() {
        this.STORAGE_KEYS = {
            CUSTOMERS: 'ans_customers',
            EXPENSE_ITEMS: 'ans_expense_items',
            PAYMENT_TERMS: 'ans_payment_terms',
            LEDGER_ENTRIES: 'ans_ledger_entries',
            SYSTEM_CONFIG: 'ans_system_config',
            COUNTERS: 'ans_counters'
        };
        
        this.initStorage();
    }

    /**
     * 初始化存储，确保所有必需的键都存在
     */
    initStorage() {
        // 初始化计数器
        if (!this.get(this.STORAGE_KEYS.COUNTERS)) {
            this.set(this.STORAGE_KEYS.COUNTERS, {
                customer: 10000, // 从ANSC-010000开始
                expense_item: 1000,
                payment_term: 100,
                ledger_entry: 1
            });
        }

        // 初始化系统配置
        if (!this.get(this.STORAGE_KEYS.SYSTEM_CONFIG)) {
            this.set(this.STORAGE_KEYS.SYSTEM_CONFIG, {
                currency: 'JPY',
                date_format: 'YYYY-MM-DD',
                tax_rate: 0.1,
                company_name: '',
                version: '1.0.0'
            });
        }

        // 初始化各模块数据
        Object.values(this.STORAGE_KEYS).forEach(key => {
            if (key !== this.STORAGE_KEYS.COUNTERS && key !== this.STORAGE_KEYS.SYSTEM_CONFIG) {
                if (!this.get(key)) {
                    this.set(key, []);
                }
            }
        });
    }

    /**
     * 获取数据
     * @param {string} key - 存储键
     * @returns {any} 存储的数据
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('读取本地存储失败:', error);
            return null;
        }
    }

    /**
     * 设置数据
     * @param {string} key - 存储键
     * @param {any} value - 要存储的数据
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('写入本地存储失败:', error);
            return false;
        }
    }

    /**
     * 删除数据
     * @param {string} key - 存储键
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除本地存储失败:', error);
            return false;
        }
    }

    /**
     * 清空所有数据
     */
    clear() {
        try {
            localStorage.clear();
            this.initStorage(); // 重新初始化
            return true;
        } catch (error) {
            console.error('清空本地存储失败:', error);
            return false;
        }
    }

    /**
     * 获取下一个编号
     * @param {string} type - 编号类型 (customer, expense_item, payment_term, ledger_entry)
     * @param {string} prefix - 编号前缀
     * @returns {string} 生成的编号
     */
    getNextCode(type, prefix = '') {
        const counters = this.get(this.STORAGE_KEYS.COUNTERS) || {};
        const currentCount = counters[type] || 0;
        const nextCount = currentCount + 1;
        
        // 更新计数器
        counters[type] = nextCount;
        this.set(this.STORAGE_KEYS.COUNTERS, counters);
        
        // 生成编号
        if (type === 'customer') {
            return `ANSC-${String(nextCount).padStart(6, '0')}`;
        } else if (type === 'expense_item') {
            return `EXPS-${String(nextCount).padStart(4, '0')}`;
        } else if (type === 'payment_term') {
            return `PAYT-${String(nextCount).padStart(3, '0')}`;
        } else if (type === 'ledger_entry') {
            return `LEDG-${String(nextCount).padStart(6, '0')}`;
        }
        
        return prefix + String(nextCount).padStart(6, '0');
    }

    /**
     * 添加数据项
     * @param {string} key - 存储键
     * @param {object} item - 要添加的数据项
     * @returns {object|null} 添加后的数据项（包含生成的ID）
     */
    addItem(key, item) {
        const data = this.get(key) || [];
        const newItem = {
            id: this.generateId(),
            ...item,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        data.push(newItem);
        
        if (this.set(key, data)) {
            return newItem;
        }
        
        return null;
    }

    /**
     * 更新数据项
     * @param {string} key - 存储键
     * @param {string} id - 数据项ID
     * @param {object} updates - 要更新的数据
     * @returns {object|null} 更新后的数据项
     */
    updateItem(key, id, updates) {
        const data = this.get(key) || [];
        const index = data.findIndex(item => item.id === id);
        
        if (index === -1) {
            return null;
        }
        
        data[index] = {
            ...data[index],
            ...updates,
            updated_at: new Date().toISOString()
        };
        
        if (this.set(key, data)) {
            return data[index];
        }
        
        return null;
    }

    /**
     * 删除数据项
     * @param {string} key - 存储键
     * @param {string} id - 数据项ID
     * @returns {boolean} 是否删除成功
     */
    deleteItem(key, id) {
        const data = this.get(key) || [];
        const filteredData = data.filter(item => item.id !== id);
        
        if (filteredData.length === data.length) {
            return false; // 没有找到要删除的项
        }
        
        return this.set(key, filteredData);
    }

    /**
     * 查找数据项
     * @param {string} key - 存储键
     * @param {object} criteria - 查找条件
     * @returns {array} 匹配的数据项
     */
    findItems(key, criteria = {}) {
        const data = this.get(key) || [];
        
        if (Object.keys(criteria).length === 0) {
            return data;
        }
        
        return data.filter(item => {
            return Object.keys(criteria).every(key => {
                if (typeof criteria[key] === 'string' && criteria[key].startsWith('%')) {
                    // 模糊搜索
                    const searchTerm = criteria[key].slice(1).toLowerCase();
                    return String(item[key]).toLowerCase().includes(searchTerm);
                }
                return item[key] === criteria[key];
            });
        });
    }

    /**
     * 排序数据项
     * @param {string} key - 存储键
     * @param {string} sortBy - 排序字段
     * @param {string} order - 排序顺序 (asc/desc)
     * @returns {array} 排序后的数据
     */
    sortItems(key, sortBy, order = 'asc') {
        const data = this.get(key) || [];
        
        return data.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            // 处理数字类型
            if (!isNaN(aVal) && !isNaN(bVal)) {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }
            
            // 处理日期类型
            if (sortBy.includes('date') || sortBy.includes('at')) {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 备份数据
     * @returns {object} 所有数据的备份
     */
    backup() {
        const backup = {};
        Object.values(this.STORAGE_KEYS).forEach(key => {
            backup[key] = this.get(key);
        });
        
        backup.backup_date = new Date().toISOString();
        backup.backup_version = '1.0.0';
        
        return backup;
    }

    /**
     * 恢复数据
     * @param {object} backupData - 备份数据
     * @returns {boolean} 是否恢复成功
     */
    restore(backupData) {
        try {
            // 验证备份数据
            if (!backupData.backup_date || !backupData.backup_version) {
                throw new Error('无效的备份文件');
            }
            
            // 清空现有数据
            this.clear();
            
            // 恢复数据
            Object.keys(backupData).forEach(key => {
                if (key !== 'backup_date' && key !== 'backup_version') {
                    this.set(key, backupData[key]);
                }
            });
            
            return true;
        } catch (error) {
            console.error('恢复数据失败:', error);
            return false;
        }
    }

    /**
     * 获取系统配置
     * @returns {object} 系统配置
     */
    getConfig() {
        return this.get(this.STORAGE_KEYS.SYSTEM_CONFIG) || {};
    }

    /**
     * 更新系统配置
     * @param {object} config - 配置更新
     * @returns {boolean} 是否更新成功
     */
    updateConfig(config) {
        const currentConfig = this.getConfig();
        const newConfig = { ...currentConfig, ...config };
        return this.set(this.STORAGE_KEYS.SYSTEM_CONFIG, newConfig);
    }

    /**
     * 获取统计数据
     * @returns {object} 统计数据
     */
    getStats() {
        return {
            customers: this.get(this.STORAGE_KEYS.CUSTOMERS)?.length || 0,
            expense_items: this.get(this.STORAGE_KEYS.EXPENSE_ITEMS)?.length || 0,
            payment_terms: this.get(this.STORAGE_KEYS.PAYMENT_TERMS)?.length || 0,
            ledger_entries: this.get(this.STORAGE_KEYS.LEDGER_ENTRIES)?.length || 0
        };
    }
}

// 创建全局存储管理器实例
window.storage = new StorageManager();