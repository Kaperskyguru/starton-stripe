const users = [];

export const create = async (data) => {
  users.push({
    email: data.email,
    wallet_address: data.address,
  });
  return data[data.length - 1];
};

export const find = async (email) => {
  return users.find((user) => user.email === email);
};
