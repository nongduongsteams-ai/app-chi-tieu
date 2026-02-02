function doGet(e) {
  return Controller.handleGet(e);
}

function doPost(e) {
  return Controller.handlePost(e);
}

function test() {
  Logger.log("Hello World");
}

// Helper function to initialize Google Sheets
function runSetup() {
  Model.setup();
  Logger.log("Setup completed! Check your Google Sheet for 3 new sheets: KhoanChi, DanhMucChi, Log");
}
