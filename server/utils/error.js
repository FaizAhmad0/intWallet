exports.InvalidType = (name, type) => {
  throw new TypeError(`${name} should be an ${type}.`);
};

exports.NullError = (name) => {
  throw new Error(`Please provide ${name}`);
};

exports.EmptyError = (name) => {
  throw new Error(`${name} can not be empty.`);
}
