#!/usr/bin/env -S npx tsx

import path from 'path';
import * as glob from 'glob';
import fs from "fs/promises"
import sass from 'sass';

const srcDir = path.join(import.meta.dirname, '../stash/ui/v2.5/src');
const buildDir =  path.join(import.meta.dirname, '../dist');
const themeVarsSassPath = `${buildDir}/theme-variables.scss`
const themeVarsCssPath = `${buildDir}/theme-variables.css`

async function buildThemeVarsSassFile() {
  const content = await getSassThemeVariables()
  if (!content) {
    throw new Error("No SASS variables found in _theme.scss")
  }
  await fs.writeFile(themeVarsSassPath, content, "utf8")
}

async function buildThemeVarsCssFile() {
  const sassContent = /* scss */`
    @use "sass:meta";
    @use "${themeVarsSassPath}" as vars;
    $vars: meta.module-variables('vars');

    :root {
      @each $name, $value in $vars {
        // Check if the value is a map
        @if meta.type-of($value) == 'map' {
          @each $sub-name, $sub-value in $value {
            --#{$name}-#{$sub-name}: #{$sub-value};
          }
        } @else {
          --#{$name}: #{$value};
        }
      }
    }
  `;

  // Compile the SCSS
  const result = sass.compileString(sassContent, {
    loadPaths: [
      path.join(srcDir, "../node_modules")
    ]
  });
  if (!result.css) {
    throw new Error("No SASS variables found in _theme.scss")
  }
  await fs.writeFile(themeVarsCssPath, result.css, "utf8")
}

async function buildAllOtherSassFiles() {
  const scssFiles = glob.sync(`${srcDir}/**/*.scss`, {
    ignore: [
      `${srcDir}/styles/_theme.scss`,
    ],
  });

  for (const file of scssFiles) {
    const relativePath = path.relative(srcDir, file);
    const outFile = path.join(buildDir, 'src', relativePath.replace(/\.scss$/, '.css'));

    let fileContent
    if (relativePath == 'index.scss') {
      const originalContent = await fs.readFile(file, "utf8")
      fileContent = originalContent.replaceAll(/\@import "src\/[^\n]*\n/g, "")
    } else {
      fileContent = `@import "${file}";`;
    }

    const contentToCompile = `
      ${await getSassThemeVariables()};
      @import "bootstrap/scss/functions";
      @import "bootstrap/scss/variables";
      @import "bootstrap/scss/mixins";
      ${fileContent}
    `;

    // Compile the SCSS
    const result = sass.compileString(contentToCompile, {
      loadPaths: [
        srcDir,
        path.join(srcDir, '..'),
        path.join(srcDir, '../node_modules'),
      ],
    });

    // Make sure the output directory exists
    await fs.mkdir(path.dirname(outFile), { recursive: true });

    await fs.writeFile(outFile, result.css);
  };
}

let _sassThemeVariablesCache: string | null = null;
async function getSassThemeVariables() {
  if (!_sassThemeVariablesCache) {
    const file = await fs.readFile(path.join(srcDir, "styles/_theme.scss"), "utf8")
    _sassThemeVariablesCache = file.match( /\$[^;:]*?:[^;]*?;/g )?.join("\n") || null;
  }
  return _sassThemeVariablesCache;
}

await buildThemeVarsSassFile()
await buildThemeVarsCssFile()
await buildAllOtherSassFiles()
