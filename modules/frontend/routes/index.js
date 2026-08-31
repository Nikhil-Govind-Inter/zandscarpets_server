const express = require('express');
const fs = require('fs');
const path = require('path');

// ANSI color helpers
const colors = {
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  cyan: (str) => `\x1b[36m${str}\x1b[0m`,
  gray: (str) => `\x1b[90m${str}\x1b[0m`,
};

const loadedRoutes = [];
const routeMap = new Map();
const warnings = [];
const routeErrors = [];
let errorCount = 0;
const startTime = Date.now();

function loadRoutes(dirPath, baseRoute = '', depth = 0) {
  const router = express.Router({ mergeParams: true });
  const indent = '  '.repeat(depth);

  let files;
  try {
    files = fs.readdirSync(dirPath);
  } catch (error) {
    console.error(`${indent}${colors.red(`✗ Cannot read ${dirPath} — ${error.message}`)}`);
    errorCount++;
    return router;
  }

  if (files.length === 0) {
    warnings.push(`Empty directory: ${dirPath}`);
  }

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const dirName = file
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      const newBaseRoute = path.posix.join(baseRoute, dirName);

      console.log(`${indent}${colors.cyan(`📁 ${dirName}/`)}`);
      const subRouter = loadRoutes(fullPath, newBaseRoute, depth + 1);
      router.use(`/${dirName}`, subRouter);
    } else if (file !== 'index.js' && file.endsWith('.js')) {
      const routeName = path.basename(file, '.js')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      const routePath = `/${routeName}`;
      const fullRoute = `/api/${path.posix.join(baseRoute, routeName)}`;

      try {
        const fileStartTime = Date.now();
        const routeModule = require(fullPath);
        const loadTime = Date.now() - fileStartTime;

        if (typeof routeModule === 'function' || routeModule instanceof express.Router) {
          router.use(routePath, routeModule);

          if (routeMap.has(fullRoute)) {
            warnings.push(`Duplicate route "${fullRoute}" (${file} conflicts with ${routeMap.get(fullRoute)})`);
            console.warn(`${indent}${colors.yellow(`⚠ ${fullRoute} — duplicate of ${routeMap.get(fullRoute)}`)}`);
          } else {
            routeMap.set(fullRoute, file);
            const slowFlag = loadTime > 50 ? colors.yellow(` (slow: ${loadTime}ms)`) : '';
            console.log(`${indent}${colors.green(`✓ ${fullRoute}`)}${slowFlag}`);
          }
          loadedRoutes.push(fullRoute);
        } else {
          const reason = `not a valid router (exported: ${typeof routeModule})`;
          routeErrors.push({ route: fullRoute, file: fullPath, reason });
          console.error(`${indent}${colors.red(`✗ ${fullRoute} — ${reason} [${file}]`)}`);
          errorCount++;
        }
      } catch (error) {
        routeErrors.push({ route: fullRoute, file: fullPath, reason: error.message, stack: error.stack });
        console.error(`${indent}${colors.red(`✗ ${fullRoute} — ${error.message} [${file}]`)}`);
        errorCount++;
      }
    }
  });

  return router;
}

const rootRouter = loadRoutes(__dirname);
const totalTime = Date.now() - startTime;

const summaryColor = errorCount ? colors.red : colors.green;
console.log(
  `\n${summaryColor(`📦 ${loadedRoutes.length} loaded, ${errorCount} failed`)}${
    warnings.length ? colors.yellow(`, ${warnings.length} warning(s)`) : ''
  } — ${colors.gray(`${totalTime}ms`)}\n`
);

rootRouter.errorReport = (req, res) => {
  res.status(routeErrors.length ? 500 : 200).json({
    loaded: loadedRoutes.length,
    errors: routeErrors,
    warnings,
  });
};

module.exports = rootRouter;