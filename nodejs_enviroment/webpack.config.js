import path from 'path';

export default {
  entry: './src/index.js',
  mode: "development",
  output: {
    filename: 'bundle.js',
    path: path.resolve('.', 'public'),
  },
};