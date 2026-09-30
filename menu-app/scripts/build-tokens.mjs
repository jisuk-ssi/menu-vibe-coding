import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const inputPath = resolve(projectDirectory, 'design/montage.tokens.json');
const outputPath = resolve(projectDirectory, 'src/tokens.css');

const tokens = JSON.parse(await readFile(inputPath, 'utf8'));

const toKebabCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\./g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const assertRecord = (value, name) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`Expected "${name}" to be an object.`);
  }
};

for (const section of [
  'color',
  'shadow',
  'opacity',
  'spacing',
  'radius',
  'breakpoint',
  'zIndex',
  'typography',
]) {
  assertRecord(tokens[section], section);
}

const declaration = (name, value) => `  ${name}: ${value};`;
const block = (selector, declarations) =>
  `${selector} {\n${declarations.join('\n')}\n}`;

const tokenValue = (token) =>
  token && typeof token === 'object' && 'value' in token
    ? token.value
    : token;

const flattenThemedTokens = (record, path = []) =>
  Object.entries(record).flatMap(([name, token]) => {
    const nextPath = [...path, name];
    const isLeaf =
      token &&
      typeof token === 'object' &&
      !Array.isArray(token) &&
      ('$type' in token || ('light' in token && 'dark' in token));

    if (isLeaf) {
      return [[nextPath.join('.'), token]];
    }

    assertRecord(token, nextPath.join('.'));
    return flattenThemedTokens(token, nextPath);
  });

const colorTokens = flattenThemedTokens(tokens.color);
const shadowTokens = flattenThemedTokens(tokens.shadow).map(([name, token]) => [
  name.startsWith('semantic.') ? name : `semantic.elevation.shadow.${name}`,
  token,
]);

const themeDeclarations = (theme) => [
  ...colorTokens.map(([name, token]) => {
    if (!(theme in token)) {
      throw new Error(`Color token "${name}" has no ${theme} value.`);
    }

    return declaration(
      `--color-${toKebabCase(name)}`,
      tokenValue(token[theme]),
    );
  }),
  ...shadowTokens.map(([name, token]) => {
    if (!(theme in token)) {
      throw new Error(`Shadow token "${name}" has no ${theme} value.`);
    }

    return declaration(
      `--shadow-${toKebabCase(name)}`,
      tokenValue(token[theme]),
    );
  }),
];

const sharedDeclarations = [
  ...Object.entries(tokens.opacity).map(([name, value]) =>
    declaration(`--opacity-${toKebabCase(name)}`, tokenValue(value)),
  ),
  ...Object.entries(tokens.spacing).map(([name, value]) =>
    declaration(`--spacing-${toKebabCase(name)}`, tokenValue(value)),
  ),
  ...Object.entries(tokens.radius).map(([name, value]) =>
    declaration(`--radius-${toKebabCase(name)}`, tokenValue(value)),
  ),
  ...Object.entries(tokens.breakpoint).map(([name, value]) =>
    declaration(`--breakpoint-${toKebabCase(name)}`, tokenValue(value)),
  ),
  ...Object.entries(tokens.zIndex).map(([name, value]) =>
    declaration(`--z-index-${toKebabCase(name)}`, tokenValue(value)),
  ),
];

const typographyVariableDeclarations = [];
const typographyClasses = [];
const typographyTokens = tokens.typography.variant ?? tokens.typography;

assertRecord(typographyTokens, 'typography.variant');

const typographyValue = (value, unit, name) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (!(unit in value)) {
      throw new Error(`Typography token "${name}" has no ${unit} value.`);
    }

    return value[unit];
  }

  return value;
};

for (const [name, token] of Object.entries(typographyTokens)) {
  assertRecord(token.fontWeight, `typography.variant.${name}.fontWeight`);

  const prefix = `--type-${toKebabCase(name)}`;
  typographyVariableDeclarations.push(
    declaration(
      `${prefix}-font-size`,
      typographyValue(token.fontSize, 'rem', `${name}.fontSize`),
    ),
    declaration(
      `${prefix}-line-height`,
      typographyValue(token.lineHeight, 'rem', `${name}.lineHeight`),
    ),
    declaration(
      `${prefix}-letter-spacing`,
      typographyValue(token.letterSpacing, 'em', `${name}.letterSpacing`),
    ),
    declaration(`${prefix}-weight-regular`, token.fontWeight.regular),
    declaration(`${prefix}-weight-medium`, token.fontWeight.medium),
    declaration(`${prefix}-weight-bold`, token.fontWeight.bold),
  );

  const className = toKebabCase(name);
  typographyClasses.push(
    `.${className} {\n` +
      `  font-size: var(${prefix}-font-size);\n` +
      `  line-height: var(${prefix}-line-height);\n` +
      `  letter-spacing: var(${prefix}-letter-spacing);\n` +
      `  font-weight: var(${prefix}-weight-regular);\n` +
      `}`,
    `.${className}.regular {\n  font-weight: var(${prefix}-weight-regular);\n}`,
    `.${className}.medium {\n  font-weight: var(${prefix}-weight-medium);\n}`,
    `.${className}.bold {\n  font-weight: var(${prefix}-weight-bold);\n}`,
  );
}

const variableNames = [
  ...themeDeclarations('light'),
  ...sharedDeclarations,
  ...typographyVariableDeclarations,
].map((line) => line.match(/^\s*(--[^:]+):/)?.[1]);
const duplicateVariableNames = variableNames.filter(
  (name, index) => name && variableNames.indexOf(name) !== index,
);

if (duplicateVariableNames.length > 0) {
  throw new Error(
    `Duplicate CSS variables: ${[...new Set(duplicateVariableNames)].join(', ')}`,
  );
}

const css = [
  '/* This file is generated by scripts/build-tokens.mjs. Do not edit directly. */',
  `/* Source: design/montage.tokens.json */`,
  '',
  block(':root', [
    ...themeDeclarations('light'),
    ...sharedDeclarations,
    ...typographyVariableDeclarations,
  ]),
  '',
  block('[data-theme="dark"]', themeDeclarations('dark')),
  '',
  ...typographyClasses,
  '',
].join('\n\n');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, css, 'utf8');

console.log(
  `Generated ${outputPath} from ${inputPath} (${colorTokens.length} colors, ${Object.keys(typographyTokens).length} typography styles).`,
);
