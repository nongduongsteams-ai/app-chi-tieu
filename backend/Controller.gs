const Controller = {
  handleGet: function(e) {
    // Safety check for testing in Apps Script Editor
    if (!e || !e.parameter) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Missing parameters. To test, deploy as Web App and call via URL with ?action=getCategories" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = e.parameter.action;
    let result;

    try {
      switch (action) {
        case 'getExpenses':
          result = Model.getExpenses(e.parameter);
          break;
        case 'getCategories':
          result = Model.getCategories();
          break;
        case 'getStats':
          result = Model.getStats(e.parameter);
          break;
        default:
          result = { success: false, message: "Invalid action" };
      }
    } catch (err) {
      result = { success: false, message: err.toString() };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  },

  handlePost: function(e) {
    // Safety check for testing in Apps Script Editor
    if (!e) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Missing event object. Use Web App URL to test POST requests." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    let data;
    try {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else {
         data = e.parameter || {};
      }
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid JSON" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = data.action || (e.parameter && e.parameter.action);
    let result;

    try {
      switch (action) {
        case 'addExpense':
          result = Model.addExpense(data);
          break;
        case 'editExpense':
          result = Model.editExpense(data);
          break;
        case 'deleteExpense':
          result = Model.deleteExpense(data);
          break;
        case 'addCategory':
          result = Model.addCategory(data);
          break;
        case 'editCategory':
          result = Model.editCategory(data);
          break;
        case 'deleteCategory':
          result = Model.deleteCategory(data);
          break;
        default:
          result = { success: false, message: "Invalid action" };
      }
    } catch (err) {
      result = { success: false, message: err.toString() };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
};
