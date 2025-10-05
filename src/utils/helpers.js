/**
 * 工具函数模块
 * 提供通用的工具函数和验证功能
 */

const Utils = {
    /**
     * 日期格式化
     * @param {Date|string} date - 日期对象或字符串
     * @param {string} format - 格式字符串 (YYYY-MM-DD, YYYY/MM/DD, etc.)
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return '';
        }
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    /**
     * 货币格式化
     * @param {number} amount - 金额
     * @param {string} currency - 货币代码 (JPY, USD, EUR)
     * @returns {string} 格式化后的货币字符串
     */
    formatCurrency(amount, currency = 'JPY') {
        if (isNaN(amount) || amount === null || amount === undefined) {
            return '¥0';
        }
        
        const numAmount = Number(amount);
        
        switch (currency.toUpperCase()) {
            case 'JPY':
                return `¥${numAmount.toLocaleString('ja-JP')}`;
            case 'USD':
                return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            case 'EUR':
                return `€${numAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
            default:
                return `¥${numAmount.toLocaleString()}`;
        }
    },

    /**
     * 数字格式化
     * @param {number} number - 数字
     * @param {number} decimals - 小数位数
     * @returns {string} 格式化后的数字字符串
     */
    formatNumber(number, decimals = 0) {
        if (isNaN(number) || number === null || number === undefined) {
            return '0';
        }
        
        return Number(number).toLocaleString('ja-JP', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * 深度克隆对象
     * @param {any} obj - 要克隆的对象
     * @returns {any} 克隆后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        
        return clonedObj;
    },

    /**
     * 防抖函数
     * @param {function} func - 要执行的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     * @param {function} func - 要执行的函数
     * @param {number} limit - 时间限制（毫秒）
     * @returns {function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 表单验证器
     */
    validator: {
        /**
         * 验证必填字段
         * @param {string} value - 要验证的值
         * @param {string} fieldName - 字段名称
         * @returns {string|null} 错误消息，如果验证通过返回null
         */
        required(value, fieldName) {
            if (!value || value.trim() === '') {
                return `${fieldName}は必須項目です`;
            }
            return null;
        },

        /**
         * 验证邮箱格式
         * @param {string} value - 要验证的值
         * @param {string} fieldName - 字段名称
         * @returns {string|null} 错误消息，如果验证通过返回null
         */
        email(value, fieldName) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                return `${fieldName}の形式が正しくありません`;
            }
            return null;
        },

        /**
         * 验证电话号码
         * @param {string} value - 要验证的值
         * @param {string} fieldName - 字段名称
         * @returns {string|null} 错误消息，如果验证通过返回null
         */
        phone(value, fieldName) {
            const phoneRegex = /^[\d\-\+\s\(\)]+$/;
            if (value && !phoneRegex.test(value)) {
                return `${fieldName}の形式が正しくありません`;
            }
            return null;
        },

        /**
         * 数値の検証
         * @param {string} value - 値
         * @param {string} fieldName - 項目名
         * @param {number} min - 最小値
         * @param {number} max - 最大値
         * @returns {string|null} エラーメッセージ、検証成功時はnull
         */
        number(value, fieldName, min = null, max = null) {
            if (value === '' || value === null || value === undefined) {
                return null;
            }
            
            const num = Number(value);
            if (isNaN(num)) {
                return `${fieldName}は数値である必要があります`;
            }
            
            if (min !== null && num < min) {
                return `${fieldName}は${min}以上である必要があります`;
            }
            
            if (max !== null && num > max) {
                return `${fieldName}は${max}以下である必要があります`;
            }
            
            return null;
        },

        /**
         * 文字列長の検証
         * @param {string} value - 値
         * @param {string} fieldName - 項目名
         * @param {number} min - 最小長
         * @param {number} max - 最大長
         * @returns {string|null} エラーメッセージ、検証成功時はnull
         */
        length(value, fieldName, min = null, max = null) {
            if (value === null || value === undefined) {
                return null;
            }
            
            const str = String(value);
            
            if (min !== null && str.length < min) {
                return `${fieldName}は${min}文字以上である必要があります`;
            }
            
            if (max !== null && str.length > max) {
                return `${fieldName}は${max}文字以下である必要があります`;
            }
            
            return null;
        },

        /**
         * 验证日期格式
         * @param {string} value - 要验证的值
         * @param {string} fieldName - 字段名称
         * @returns {string|null} 错误消息，如果验证通过返回null
         */
        date(value, fieldName) {
            if (!value) {
                return null;
            }
            
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return `${fieldName}の日付形式が正しくありません`;
            }
            
            return null;
        },

        /**
         * 执行多个验证
         * @param {object} data - 要验证的数据
         * @param {object} rules - 验证规则
         * @returns {object} 验证结果 { isValid: boolean, errors: object }
         */
        validate(data, rules) {
            const errors = {};
            let isValid = true;
            
            Object.keys(rules).forEach(field => {
                const value = data[field];
                const fieldRules = rules[field];
                
                if (!Array.isArray(fieldRules)) {
                    fieldRules = [fieldRules];
                }
                
                for (const rule of fieldRules) {
                    let error = null;
                    
                    if (typeof rule === 'string') {
                        // 简单的字符串规则
                        switch (rule) {
                            case 'required':
                                error = this.required(value, field);
                                break;
                            case 'email':
                                error = this.email(value, field);
                                break;
                            case 'phone':
                                error = this.phone(value, field);
                                break;
                        }
                    } else if (typeof rule === 'object') {
                        // 复杂的对象规则
                        switch (rule.type) {
                            case 'required':
                                error = this.required(value, field);
                                break;
                            case 'email':
                                error = this.email(value, field);
                                break;
                            case 'phone':
                                error = this.phone(value, field);
                                break;
                            case 'number':
                                error = this.number(value, field, rule.min, rule.max);
                                break;
                            case 'length':
                                error = this.length(value, field, rule.min, rule.max);
                                break;
                            case 'date':
                                error = this.date(value, field);
                                break;
                        }
                    }
                    
                    if (error) {
                        errors[field] = error;
                        isValid = false;
                        break;
                    }
                }
            });
            
            return { isValid, errors };
        }
    },

    /**
     * 字符串工具
     */
    string: {
        /**
         * 截取字符串并添加省略号
         * @param {string} str - 原字符串
         * @param {number} length - 最大长度
         * @returns {string} 截取后的字符串
         */
        truncate(str, length = 50) {
            if (!str || str.length <= length) {
                return str;
            }
            return str.substring(0, length) + '...';
        },

        /**
         * 首字母大写
         * @param {string} str - 字符串
         * @returns {string} 首字母大写的字符串
         */
        capitalize(str) {
            if (!str) return str;
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        /**
         * 驼峰命名转换
         * @param {string} str - 字符串
         * @returns {string} 驼峰命名的字符串
         */
        toCamelCase(str) {
            if (!str) return str;
            return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
        },

        /**
         * 生成随机字符串
         * @param {number} length - 字符串长度
         * @param {string} charset - 字符集
         * @returns {string} 随机字符串
         */
        random(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
            let result = '';
            for (let i = 0; i < length; i++) {
                result += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return result;
        }
    },

    /**
     * 数组工具
     */
    array: {
        /**
         * 数组去重
         * @param {array} arr - 数组
         * @returns {array} 去重后的数组
         */
        unique(arr) {
            return [...new Set(arr)];
        },

        /**
         * 数组分组
         * @param {array} arr - 数组
         * @param {function|string} key - 分组键或函数
         * @returns {object} 分组后的对象
         */
        groupBy(arr, key) {
            return arr.reduce((groups, item) => {
                const group = typeof key === 'function' ? key(item) : item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        },

        /**
         * 数组排序
         * @param {array} arr - 数组
         * @param {string|function} key - 排序键或函数
         * @param {string} order - 排序顺序 (asc/desc)
         * @returns {array} 排序后的数组
         */
        sortBy(arr, key, order = 'asc') {
            return [...arr].sort((a, b) => {
                let aVal = typeof key === 'function' ? key(a) : a[key];
                let bVal = typeof key === 'function' ? key(b) : b[key];
                
                // 处理数字类型
                if (!isNaN(aVal) && !isNaN(bVal)) {
                    aVal = Number(aVal);
                    bVal = Number(bVal);
                }
                
                // 处理日期类型
                if (key.includes('date') || key.includes('at')) {
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
    },

    /**
     * DOM工具
     */
    dom: {
        /**
         * 创建元素
         * @param {string} tag - 元素标签
         * @param {object} attributes - 元素属性
         * @param {string|array} content - 元素内容
         * @returns {HTMLElement} 创建的元素
         */
        createElement(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'dataset') {
                    Object.assign(element.dataset, attributes[key]);
                } else if (key.startsWith('on') && typeof attributes[key] === 'function') {
                    element.addEventListener(key.slice(2).toLowerCase(), attributes[key]);
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });
            
            if (content) {
                if (typeof content === 'string') {
                    element.innerHTML = content;
                } else if (Array.isArray(content)) {
                    content.forEach(child => {
                        if (typeof child === 'string') {
                            element.insertAdjacentHTML('beforeend', child);
                        } else {
                            element.appendChild(child);
                        }
                    });
                } else {
                    element.appendChild(content);
                }
            }
            
            return element;
        },

        /**
         * 显示加载状态
         * @param {HTMLElement} element - 目标元素
         * @param {boolean} show - 是否显示加载状态
         */
        showLoading(element, show = true) {
            if (show) {
                element.classList.add('loading');
                element.disabled = true;
            } else {
                element.classList.remove('loading');
                element.disabled = false;
            }
        },

        /**
         * 显示错误消息
         * @param {HTMLElement} element - 目标元素
         * @param {string} message - 错误消息
         */
        showError(element, message) {
            element.classList.add('error');
            const errorElement = element.parentNode.querySelector('.form-error');
            if (errorElement) {
                errorElement.textContent = message;
            }
        },

        /**
         * 清除错误状态
         * @param {HTMLElement} element - 目标元素
         */
        clearError(element) {
            element.classList.remove('error');
            const errorElement = element.parentNode.querySelector('.form-error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }
};

// 将工具函数挂载到全局
window.Utils = Utils;