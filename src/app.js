/**
 * 应用主模块
 * 负责初始化所有模块和管理应用状态
 */

class App {
    constructor() {
        this.currentModule = 'dashboard';
        this.modules = {};
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('アプリケーション初期化に失敗しました:', error);
            this.showError('アプリケーション初期化に失敗しました。ページを再読み込みしてください');
        }
    }

    /**
     * 初始化应用组件
     */
    initializeApp() {
        // 显示加载状态
        this.showLoading();

        try {
            // 初始化存储
            if (!window.storage) {
                window.storage = new StorageManager();
            }
            // 绑定到实例，便于统一访问
            this.storage = window.storage;

            // 初始化基础组件
            if (!window.Components) {
                window.Components = new BaseComponents();
            }

            // 初始化工具函数
            if (!window.Utils) {
                window.Utils = Utils;
            }

            // 绑定导航事件
            this.bindNavigationEvents();

            // 初始化模块
            this.initializeModules();

            // 显示默认模块
            this.showModule('dashboard');

            // 隐藏加载状态
            this.hideLoading();

            console.log('应用初始化完成');
        } catch (error) {
            console.error('アプリケーション初期化に失敗しました:', error);
            this.showError('アプリケーション初期化に失敗しました。ページを再読み込みしてください');
        }
    }

    /**
     * 绑定导航事件
     */
    bindNavigationEvents() {
        // 主导航（统一使用 data-page）
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = link.dataset.page;
                this.showModule(module);
            });
        });

        // 备份按钮
        const backupBtn = document.getElementById('backup-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.handleBackup());
        }

        // 恢复按钮
        const restoreBtn = document.getElementById('restore-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => this.handleRestore());
        }
    }

    /**
     * 初始化所有模块
     */
    initializeModules() {
        // 往来单位管理模块
        if (typeof CustomerManager !== 'undefined') {
            this.modules.customers = new CustomerManager();
        }

        // 费用项目管理模块
        if (typeof ExpenseItemManager !== 'undefined') {
            this.modules.expenseItems = new ExpenseItemManager();
        }
    }

    /**
     * 显示指定模块
     */
    showModule(moduleName) {
        // 隐藏所有页面（统一使用 .page）
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 移除导航激活状态（统一使用 data-page）
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.classList.remove('active');
        });

        // 显示目标页面（id: <module>-page）
        const targetPage = document.getElementById(`${moduleName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentModule = moduleName;

            // 激活对应导航
            const targetNav = document.querySelector(`[data-page="${moduleName}"]`);
            if (targetNav) {
                targetNav.classList.add('active');
            }

            // 更新页面标题
            this.updatePageTitle(moduleName);

            // 执行模块特定逻辑
            this.onModuleShow(moduleName);
        } else {
            console.warn(`模块 ${moduleName} 不存在`);
        }
    }

    /**
     * 模块显示时的回调
     */
    onModuleShow(moduleName) {
        switch (moduleName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'customers':
                if (this.modules.customers) {
                    this.modules.customers.renderTable();
                }
                break;
            case 'expense-items':
                if (this.modules.expenseItems) {
                    this.modules.expenseItems.renderTable();
                }
                break;
            default:
                break;
        }
    }

    /**
     * 更新仪表板数据
     */
    updateDashboard() {
        try {
            const stats = this.storage.getStats();
            
            // 更新统计数据（与 index.html 的ID一致）
            this.updateStatCard('customer-count', stats.customers);
            this.updateStatCard('expense-count', stats.expense_items);
            this.updateStatCard('payment-terms-count', stats.payment_terms);
            this.updateStatCard('ledger-count', stats.ledger_entries);

            // 更新最近活动
            this.updateRecentActivity();

            console.log('ダッシュボードのデータを更新しました');
        } catch (error) {
            console.error('ダッシュボードの更新に失敗しました:', error);
        }
    }

    /**
     * 更新统计卡片
     */
    updateStatCard(cardId, value) {
        const el = document.getElementById(cardId);
        if (el) {
            // 兼容存在 .stat-value 子元素或直接设置到当前元素
            const valueElement = el.querySelector && el.querySelector('.stat-value') ? el.querySelector('.stat-value') : el;
            valueElement.style.opacity = '0';
            setTimeout(() => {
                valueElement.textContent = value;
                valueElement.style.opacity = '1';
            }, 150);
        }
    }

    /**
     * 更新最近活动
     */
    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;

        // 获取最近的活动数据（这里使用模拟数据）
        const recentActivities = this.getRecentActivities();
        
        if (recentActivities.length === 0) {
            activityContainer.innerHTML = '<div class="text-muted">暂无最近活动</div>';
            return;
        }

        const activityList = Utils.dom.createElement('div', { className: 'activity-list' });
        
        recentActivities.forEach(activity => {
            const activityItem = Utils.dom.createElement('div', { className: 'activity-item' }, [
                Utils.dom.createElement('div', { className: 'activity-icon' }, 
                    `<i class="fas ${activity.icon}"></i>`
                ),
                Utils.dom.createElement('div', { className: 'activity-content' }, [
                    Utils.dom.createElement('div', { className: 'activity-title' }, activity.title),
                    Utils.dom.createElement('div', { className: 'activity-time' }, 
                        Utils.date.format(activity.time)
                    )
                ])
            ]);
            
            activityList.appendChild(activityItem);
        });

        activityContainer.innerHTML = '';
        activityContainer.appendChild(activityList);
    }

    /**
     * 获取最近活动（模拟数据）
     */
    getRecentActivities() {
        const activities = [];
        
        // 获取最近添加的客户
        const customers = this.storage.get(this.storage.STORAGE_KEYS.CUSTOMERS) || [];
        const recentCustomers = customers
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);

        recentCustomers.forEach(customer => {
            activities.push({
                title: `新增往来单位：${customer.name}`,
                time: new Date(customer.created_at),
                icon: 'fa-user-plus'
            });
        });

        // 获取最近添加的费用项目
        const expenseItems = this.storage.get(this.storage.STORAGE_KEYS.EXPENSE_ITEMS) || [];
        const recentItems = expenseItems
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);

        recentItems.forEach(item => {
            activities.push({
                title: `新增费用项目：${item.name}`,
                time: new Date(item.created_at),
                icon: 'fa-plus-circle'
            });
        });

        // 按时间排序并限制数量
        return activities
            .sort((a, b) => b.time - a.time)
            .slice(0, 5);
    }

    /**
     * 更新页面标题
     */
    updatePageTitle(moduleName) {
        const titles = {
            'dashboard': 'ダッシュボード',
            'customers': '取引先管理',
            'expense-items': '費用項目管理',
            'payment-terms': '支払条件管理',
            'ledger': '台帳管理',
            'reports': 'レポート出力'
        };

        const title = titles[moduleName] || '物流財務台帳管理システム';
        document.title = `${title} - 物流財務台帳管理システム`;
    }

    /**
     * 处理备份
     */
    async handleBackup() {
        try {
            const backupData = this.storage.backup();
            const backupJson = JSON.stringify(backupData, null, 2);
            
            // 创建下载链接
            const blob = new Blob([backupJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_${Utils.date.format(new Date(), 'YYYYMMDD_HHmmss')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            Components.createToast({
                message: '数据备份成功！',
                type: 'success'
            });
        } catch (error) {
            console.error('备份失败:', error);
            Components.createToast({
                message: '备份失败，请重试',
                type: 'error'
            });
        }
    }

    /**
     * 处理恢复
     */
    async handleRestore() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backupData = JSON.parse(e.target.result);
                        this.storage.restore(backupData);
                        
                        Components.createToast({
                            message: '数据恢复成功！',
                            type: 'success'
                        });

                        // 刷新当前模块
                        this.onModuleShow(this.currentModule);
                    } catch (error) {
                        console.error('恢复失败:', error);
                        Components.createToast({
                            message: '数据恢复失败，请检查文件格式',
                            type: 'error'
                        });
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        } catch (error) {
            console.error('恢复失败:', error);
            Components.createToast({
                message: '恢复失败，请重试',
                type: 'error'
            });
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        Components.createToast({
            message,
            type: 'error'
        });
    }
}

// 初始化应用
window.app = new App();