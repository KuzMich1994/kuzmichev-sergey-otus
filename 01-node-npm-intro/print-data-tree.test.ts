import {data, printTree} from './index';

describe('data-tree', () => {

  test('should print correct structure', async () => {

    const result = printTree(data);

    const expectedOutput = `1
├── 2
│   ├── 3
│   │   ├── 7
│   │   └── 8
│   │       ├── 9
│   │       └── 10
│   └── 4
└── 5
    └── 6
`;

    expect(result).toBe(expectedOutput)

  });

  test('should return only root name if there are no items', () => {
    const singleNode = { name: 42 };
    expect(printTree(singleNode)).toBe('42\n');
  });

  test('should handle tree with one child correctly', () => {
    const simpleTree = {
      name: 1,
      items: [
        { name: 2 }
      ]
    };

    const expected = `1
└── 2
`;

    expect(printTree(simpleTree)).toBe(expected);
  });
});