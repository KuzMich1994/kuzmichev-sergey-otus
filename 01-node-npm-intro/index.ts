interface Tree {
  name: number;
  items?: Tree[];
}

const data: Tree = {
  name: 1,
  items: [
    {
      name: 2,
      items: [
        {
          name: 3,
          items: [
            { name: 7 },
            {
              name: 8,
              items: [
                { name: 9 },
                { name: 10 }
              ]
            }
          ]
        },
        { name: 4 }
      ]
    },
    {
      name: 5,
      items: [
        { name: 6 }
      ]
    },
  ],
};

function printTree(node: Tree, prefix = '', step = 0) {
  let result = '';

  if (step === 0) {
    result += `${node.name}\n`;
  }

  if (Array.isArray(node.items)) {
    node.items.forEach((item, index, array) => {
      const isLast = index === array.length - 1;
      const connector = isLast ? '└── ' : '├── ';

      result += prefix + connector + item.name + '\n';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      result += printTree(item, newPrefix, step + 1);
    });
  }

  return result;
}

console.log(printTree(data));