import '@testing-library/jest-dom';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};