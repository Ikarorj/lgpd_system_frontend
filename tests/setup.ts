import '@testing-library/jest-dom';

const originalError = console.error;
const suppressed = [
  'React Router Future Flag Warning',
  'Error: Uncaught [Error: useAuth must be used within an AuthProvider]',
];

console.error = (...args: unknown[]) => {
  if (suppressed.some((msg) => typeof args[0] === 'string' && args[0].includes(msg))) {
    return;
  }
  originalError.call(console, ...args);
};
