import fs from 'fs';
import path from 'path';

let dirCount = 0;
let fileCount = 0;

const tree = (dirPath: string, depth = Infinity, prefix = ''): string => {
  if (depth < 0) {
    return;
  }

  let items: fs.Dirent[];

  try {
    items = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (error) {
    console.error(`Ошибка: не удалось прочитать директорию ${dirPath}`);
    return;
  }

  const dirs = items.filter((item) => item.isDirectory());
  const files = items.filter((item) => item.isFile());

  [...dirs, ...files].forEach((item, index, array) => {
    const isLast = index === array.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    console.log(prefix + connector + item.name);
    fileCount += 1;
    if (item.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      dirCount += 1;
      tree(path.join(dirPath, item.name), depth - 1, newPrefix);
    }
  });
}

const printProjectStructure = () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Ошибка: укажите путь к директории');
    process.exit(1);
  }

  const dirPath = args[0];
  let depth = Infinity;
  const depthIndex = args.findIndex((arg) => arg === '--depth' || arg === '-d');

  if (depthIndex !== -1 && args[depthIndex + 1]) {
    depth = parseInt(args[depthIndex + 1]);

    if (isNaN(depth) || depth < 0) {
      console.error('Ошибка: некорректное значение глубины');
      process.exit(1);
    }
  }

  console.log(path.basename(dirPath));
  tree(dirPath, depth);

  console.log(`${dirCount} directories, ${fileCount} files`);
}

printProjectStructure();
