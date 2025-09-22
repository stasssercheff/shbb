body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  color: #333;
}

.page-header {
  padding: 10px 20px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.lang-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.lang-btn {
  flex: 1;
  padding: 10px 0;
  background-color: #d8cfc0;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: 0.2s;
}

.lang-btn:hover {
  background-color: #c1b29a;
}

.nav-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.nav-btn {
  flex: 1;
  max-width: 150px;
  padding: 10px 15px;
  background-color: #d8cfc0;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: 0.2s;
}

.nav-btn:hover {
  background-color: #c1b29a;
}

.main-container {
  max-width: 500px;
  margin: 40px auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0,0,0,0.1);
}

.date-container {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

#checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fdfdfd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.checklist-item label {
  font-weight: 500;
}

.checklist-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

#sendBtn {
  width: 100%;
  background-color: #444;
  color: #fff;
  border: none;
  padding: 14px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  transition: 0.2s;
}

#sendBtn:hover {
  background-color: #222;
}

#result {
  margin-top: 15px;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  font-size: 14px;
  white-space: pre-wrap;
}
