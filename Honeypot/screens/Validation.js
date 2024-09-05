// validation.js

export const validateEmail = (email) => {
    const re =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  export const validatePassword = (password) => {
    // รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร
    return password.length >= 6;
  };
  
  export const validatePhone = (phone) => {
    const re = /^0\d{9}$/;
    return re.test(String(phone));
  };

  export const validateDate = (year, month, day) => {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
  
    if (isNaN(yearNum) || yearNum < 1900) {
      return 'Invalid year';
    }
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return 'Invalid month';
    }
  
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (isNaN(dayNum) || dayNum < 1 || dayNum > daysInMonth) {
      return 'Invalid day';
    }
  
    return null; // No errors
  };