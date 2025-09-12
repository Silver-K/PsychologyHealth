/**
 * 将字节转化为可读性更好的单位
 * @param {*} size 字节
 */
function prettyMemorySize(size) {
  const INC = 1024;
  const LIMIT = 0.9;
  const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let cur = size;
  while (cur > INC * LIMIT) {
    index += 1;
    cur /= INC;
  }
  return `${cur}${UNITS[index]}`;
}

function dataControl() {
  const fs = require('fs').promises;
  const path = require('path');
  const basePath = path.resolve('database');
  const defaultError = (err) => {
    if (err && err.message) {
      console.log(err.message);
    }
  };
  const errorCb = [defaultError];
  function onError(callback) {
    errorCb.push(callback);
  }
  function callError(error) {
    errorCb.forEach((cb) => cb(error));
  }
  function resetOnError() {
    errorCb.length = 1;
  }
  async function exists(file) {
    const f = path.resolve(basePath, `${file}.json`);
    const e = await fs.access(f).catch(() => false);
    let content = '';
    if (e !== false) {
      try {
        content = JSON.parse(await fs.readFile(f, 'utf-8'));
        return {
          path: f,
          content: content || [],
          success: true,
          error: null,
        };
      } catch (error) {
        callError({
          type: 'Unknown',
          code: 500,
          message: error.message,
        });
        return {
          success: false,
          content,
        }
      }      
    } else {
      callError({
        type: 'NotFound',
        code: 404,
        message: `cannot find ${file}`,
      });
      return {
        success: false,
        content,
      }
    }
  }
  async function create(file, data) {
    const { path: p, success, content } = await exists(file);
    if (success) {
      Array.isArray(data) ? content.push(...data) : content.push(data);
      await fs.writeFile(p, JSON.stringify(content), 'utf-8');
    }
  }
  async function remove(file, key) {
    const { path: p, success, content } = await exists(file);
    if (success) {
      const index = content.findIndex((item) => item.id === key);
      if (index > -1) {
        content.splice(index, 1);
        await fs.writeFile(p, JSON.stringify(content), 'utf-8');
      }      
    }
  }
  async function edit(file, key, data) {
    const { path: p, success, content } = await exists(file);
    if (success) {
      const index = content.findIndex((item) => item.id === key);
      if (index > -1) {
        if (typeof data === 'function') {
          content[index] = data({ ...content[index] });
        } else {
          content[index] = {
            ...content[index],
            ...data,
          };
        }
        await fs.writeFile(p, JSON.stringify(content), 'utf-8');
      }      
    }
  }
  async function lookup(file, filter) {
    const { success, content } = await exists(file);
    if (success) {
      return filter(content);
    }
  }
  async function overwrite(file, data) {
    const { path: p, success } = await exists(file);
    if (success) {
      await fs.writeFile(p, JSON.stringify(data), 'utf-8');
    }
  }
  return {
    create,
    remove,
    edit,
    lookup,
    overwrite,
    onError,
    resetOnError
  }
}

function docxtemplate() {
  const Docxtemp = require('docxtemplater');
  const Pizzip = require('pizzip');
  const fs = require('fs');
  const path = require('path');

  function render(tempName, data) {
    const tempPath = path.resolve(__dirname, '../template', tempName);
    const tempContent = fs.readFileSync(tempPath, 'binary');
    const zip = new Pizzip(tempContent);
    try {
      const doc = new Docxtemp(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      doc.render(data);
      return doc.toBuffer();
    } catch (error) {
      console.log(error);
    }    
  }
  return render;
}

module.exports = {
  prettyMemorySize,
  dataControl,
  docxtemplate
}

