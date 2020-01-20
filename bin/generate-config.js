const { App, Utils } = require('adapt-authoring-core');
const fs = require('fs-extra');
const path = require('path');
const ConfigUtils = require('adapt-authoring-config').Utils;

const NODE_ENV = process.env.NODE_ENV;
const useDefaults = process.env.aat_defaults && process.env.aat_defaults.match(/true|y/);
const confDir = path.resolve(path.join(process.cwd(), 'conf'));
const outpath = path.join(confDir, `${NODE_ENV}.config.js`);
const configJson = {};

async function init() {
  try {
    Object.assign(configJson, require(outpath));
    console.log(`Config already exists for NODE_ENV '${NODE_ENV}'. Any missing values will be added.`);
  } catch(e) {
    console.log(`No config found for NODE_ENV '${NODE_ENV}'. File will be written to ${outpath}\n`);
  }
  try {
    await processDeps();
    await fs.ensureDir(confDir);
    await fs.writeFile(outpath, `module.exports = ${JSON.stringify(configJson, null, 2)};`);

    console.log('Config file written successfully.\n');
    console.log('NOTE: any null values will likely need to be specified manually.\n');
  } catch(e) {
    console.log(`Failed to write ${outpath}\n${e}`);
  }
}

function getDeps() {
  try {
    const appPkg = require(path.join(process.cwd(), 'package.json'));
    return Object.keys({ ...appPkg.dependencies, ...appPkg.devDependencies });
  } catch(e) {
    console.log('Failed to load package.json', e);
  }
}

async function processDeps() {
  const deps = getDeps();
  const promises = deps.map(async d => {
    const schema = await ConfigUtils.loadConfigSchema(Utils.getModuleDir(d));
    if(!schema) {
      return;
    }
    const generated = Object.entries(schema.properties).reduce((memo, [attr, config]) => {
      config.required = schema.required && schema.required.includes(attr);
      if(useDefaults || config.required) {
        memo[attr] = getValueForAttr(attr, config);
      }
      return memo;
    }, {});
    if(Object.keys(generated).length) {
      configJson[d] = Object.assign({}, configJson[d], generated);
    }
  });
  await Promise.all(promises);
}

function getValueForAttr(attr, config) {
  if(config.required) return null;
  if(config.default) return config.default;
}

init();
