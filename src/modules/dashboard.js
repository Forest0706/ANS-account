/**
 * 仪表盘模块占位
 * 统计渲染由 App.updateDashboard 负责
 */
(function () {
  window.DashboardModule = {
    init() {},
    refresh() {
      if (window.app && typeof window.app.updateDashboard === 'function') {
        window.app.updateDashboard();
      }
    }
  };
})();