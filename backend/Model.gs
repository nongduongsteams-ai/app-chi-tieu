const SHEET_NAMES = {
  EXPENSES: 'KhoanChi',
  CATEGORIES: 'DanhMucChi',
  LOGS: 'Log'
};

const Model = {
  getDb: function() {
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  setup: function() {
    const ss = this.getDb();
    
    // Setup KhoanChi
    let sExpense = ss.getSheetByName(SHEET_NAMES.EXPENSES);
    if (!sExpense) {
      sExpense = ss.insertSheet(SHEET_NAMES.EXPENSES);
      sExpense.appendRow(['id', 'expense_date', 'expense_time', 'category', 'amount', 'location', 'description', 'created_by', 'email', 'platform', 'created_at', 'updated_at', 'deleted']);
    }

    // Setup DanhMucChi
    let sCat = ss.getSheetByName(SHEET_NAMES.CATEGORIES);
    if (!sCat) {
      sCat = ss.insertSheet(SHEET_NAMES.CATEGORIES);
      sCat.appendRow(['id', 'category_name', 'description', 'status']);
      // Add defaults
      sCat.appendRow([Utilities.getUuid(), 'Ăn uống', 'Chi phí ăn uống hàng ngày', 'active']);
      sCat.appendRow([Utilities.getUuid(), 'Đi lại', 'Xăng xe, grab, bus', 'active']);
      sCat.appendRow([Utilities.getUuid(), 'Tiền nhà', 'Tiền thuê nhà, điện nước', 'active']);
    }

    // Setup Log
    let sLog = ss.getSheetByName(SHEET_NAMES.LOGS);
    if (!sLog) {
      sLog = ss.insertSheet(SHEET_NAMES.LOGS);
      sLog.appendRow(['action', 'record_id', 'user', 'timestamp']);
    }
  },

  getExpenses: function(params) {
    const sheet = this.getDb().getSheetByName(SHEET_NAMES.EXPENSES);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Map to objects
    let expenses = rows.map(r => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });

    // Filter deleted
    expenses = expenses.filter(e => String(e.deleted) !== 'true');

    // Apply filters
    if (params.month) { // Format YYYY-MM
      expenses = expenses.filter(e => {
        const d = new Date(e.expense_date);
        const m = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        return m === params.month;
      });
    }

    if (params.category) {
      expenses = expenses.filter(e => e.category === params.category);
    }
    
    // Sort by date desc
    expenses.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));

    return { success: true, data: expenses };
  },

  addExpense: function(data) {
    const sheet = this.getDb().getSheetByName(SHEET_NAMES.EXPENSES);
    const id = Utilities.getUuid();
    const now = new Date();
    
    // 'id', 'expense_date', 'expense_time', 'category', 'amount', 'location', 'description', 'created_by', 'email', 'platform', 'created_at', 'updated_at', 'deleted'
    const row = [
      id,
      data.expense_date,
      data.expense_time || '',
      data.category,
      data.amount,
      data.location || '',
      data.description || '',
      data.created_by || 'Anonymous',
      data.email || '',
      data.platform || 'web',
      now,
      now,
      'false'
    ];
    
    sheet.appendRow(row);
    this.logAction('addExpense', id, data.email);
    return { success: true, id: id };
  },

  editExpense: function(data) {
    const sheet = this.getDb().getSheetByName(SHEET_NAMES.EXPENSES);
    const values = sheet.getDataRange().getValues();
    const idIndex = 0; // id is first
    
    for (let i = 1; i < values.length; i++) {
        if (values[i][idIndex] == data.id) {
            // Update fields
            // headers: id(0), date(1), time(2), cat(3), amt(4), location(5), desc(6), by(7), email(8), plat(9), created(10), updated(11), del(12)
            
            // Map updates
            if (data.expense_date) values[i][1] = data.expense_date;
            if (data.expense_time) values[i][2] = data.expense_time;
            if (data.category) values[i][3] = data.category;
            if (data.amount) values[i][4] = data.amount;
            if (data.location !== undefined) values[i][5] = data.location;
            if (data.description) values[i][6] = data.description;
            
            values[i][11] = new Date(); // updated_at

            sheet.getRange(i + 1, 1, 1, values[i].length).setValues([values[i]]);
            this.logAction('editExpense', data.id, data.email);
            return { success: true };
        }
    }
    return { success: false, message: 'Expense not found' };
  },

  deleteExpense: function(data) {
    const sheet = this.getDb().getSheetByName(SHEET_NAMES.EXPENSES);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
        if (values[i][0] == data.id) {
            // Soft delete: col 12 (0-indexed) -> 13th col
            sheet.getRange(i + 1, 13).setValue('true');
             this.logAction('deleteExpense', data.id, data.email);
            return { success: true };
        }
    }
    return { success: false, message: 'Expense not found' };
  },

  getCategories: function() {
    const sheet = this.getDb().getSheetByName(SHEET_NAMES.CATEGORIES);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    let cats = rows.map(r => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });
    
    // Filter active? Or just return all and let frontend decide
    return { success: true, data: cats };
  },

  // Simple stats
  getStats: function(params) {
      // Reuse getExpenses to get filtered data
      const res = this.getExpenses(params);
      if(!res.success) return res;
      const expenses = res.data;

      // Calculate totals
      let total = 0;
      let byCategory = {};

      expenses.forEach(e => {
          const amt = Number(e.amount) || 0;
          total += amt;
          if(!byCategory[e.category]) byCategory[e.category] = 0;
          byCategory[e.category] += amt;
      });

      return {
          success: true,
          data: {
              total: total,
              byCategory: byCategory,
              count: expenses.length
          }
      };
  },

  addCategory: function(data) {
    const sheet = this.getDb().getSheetByName(SHEET_NAMES.CATEGORIES);
    const id = Utilities.getUuid();
    
    // 'id', 'category_name', 'description', 'status'
    const row = [
      id,
      data.category_name,
      data.description || '',
      data.status || 'active'
    ];
    
    sheet.appendRow(row);
    this.logAction('addCategory', id, 'system');
    return { success: true, id: id };
  },

  editCategory: function(data) {
    const sheet = this.getDb().getSheetByName(SHEET_NAMES.CATEGORIES);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
        if (values[i][0] == data.id) {
            // Update fields: id(0), category_name(1), description(2), status(3)
            if (data.category_name) values[i][1] = data.category_name;
            if (data.description !== undefined) values[i][2] = data.description;
            if (data.status) values[i][3] = data.status;
            
            sheet.getRange(i + 1, 1, 1, values[i].length).setValues([values[i]]);
            this.logAction('editCategory', data.id, 'system');
            return { success: true };
        }
    }
    return { success: false, message: 'Category not found' };
  },

  deleteCategory: function(data) {
    const sheet = this.getDb().getSheetByName(SHEET_NAMES.CATEGORIES);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
        if (values[i][0] == data.id) {
            sheet.deleteRow(i + 1);
            this.logAction('deleteCategory', data.id, 'system');
            return { success: true };
        }
    }
    return { success: false, message: 'Category not found' };
  },

  logAction: function(action, recordId, user) {
     const sheet = this.getDb().getSheetByName(SHEET_NAMES.LOGS);
     sheet.appendRow([action, recordId, user || 'unknown', new Date()]);
  }
};
