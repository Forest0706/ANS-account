/**
 * 台账管理模块占位
 * 后续将实现母台账/子发票的CRUD与统计
 */
class LedgerManager {
  constructor() {
    this.storage = window.storage;
    this.entries = [];
  }
  init() {
    this.entries = this.storage.get(this.storage.STORAGE_KEYS.LEDGER_ENTRIES) || [];
  }
  renderTable() {
    // 占位：未来实现台账列表渲染
  }
}

window.LedgerManager = LedgerManager;