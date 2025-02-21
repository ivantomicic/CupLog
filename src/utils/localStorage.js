export const saveToLocalStorage = (key, data) => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return;
  
  // Prefix the key with user ID to separate data between users
  const userKey = `${user.id}_${key}`;
  localStorage.setItem(userKey, JSON.stringify(data));
};

export const getFromLocalStorage = (key) => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return [];
  
  // Get data specific to the current user
  const userKey = `${user.id}_${key}`;
  const data = localStorage.getItem(userKey);
  return data ? JSON.parse(data) : [];
};