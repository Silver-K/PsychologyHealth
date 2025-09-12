const { nanoid } = require('nanoid');
const { dataControl, docxtemplate } = require('../utils/helper');
const { textifyData, StaticsLabels } = require('shared');
const dayjs = require('dayjs');
const FORMAT = 'YYYY/MM';

exports.getMinorsInfo = async (req, res, next) => {
  const { lookup, onError } = dataControl();
  onError(next);
  const streetMap = {};
  const communityMap = {};
  if (req.body?.searchVal || req.body?.filter) {
    await lookup('streets', (result) => result.forEach((item) => {
      streetMap[item.id] = item.name;
    }));
    await lookup('communities', (result) => result.forEach((item) => {
      communityMap[item.id] = item.name;
    }));
  }
  try {
    const finalData = await lookup('minors', (result) => {
      if (result && Array.isArray(result)) {
        const { searchVal } = req.body || {};
        const filter = Object.keys(req.body || {}).filter((key) => key !== 'searchVal').reduce((acc, cur) => {
          if (!acc) {
            acc = Object.create(null);
          }
          acc[cur] = req.body[cur]; 
          return acc;
        }, void 0);
        if (!filter && !searchVal) {
          return result ? result : [];
        }
        let filterdData = result;
        if (searchVal) {
          filterdData = filterdData.filter((item) => {
            return Object.keys(item).filter(i => i !== 'id').some((key) => {
              const textData = textifyData(item, streetMap, communityMap);
              const value = textData[key];
              return (typeof value === 'string' && value) ? value.includes(searchVal) || searchVal.includes(value) : false
            });
          });
        }
        if (filter) {
          const keys = Object.keys(filter);
          keys.forEach((key) => {
            const v = filter[key];
            if (!v) {
              return;
            }
            filterdData = filterdData.filter((item) => {
              const textData = textifyData(item, streetMap, communityMap);
              const value = textData[key];
              if (typeof value === 'string') {
                return value.includes(String(v));
              }
              if (typeof value === 'number') {
                return value === Number(v);
              }
              if (typeof value === 'boolean') {
                return value === Boolean(v);
              }
            })
          });
        }  
        return filterdData
      } else {
        return []
      }
    });  
    if (finalData) {
      res.status(200).json({
        success: true,
        data: finalData,
        message: 'get minors successfully',
      });
    } 
  } catch(error) {
    next(error);
  }
}

exports.getMinorsCategoryCount = async (req, res, next) => {
  const { lookup, onError } = dataControl();
  onError(next);
  try {
    const result = await lookup('minors', (result) => {
      return Object.keys(StaticsLabels).map((category) => {
        const categoryMap = result.reduce((acc, cur) => {
          const values = cur[category];
          const key = typeof values === 'boolean' 
          ?  values === true ? '是' : '否'
          : String(values);

          if (acc[key]) {
            acc[key].push(cur);
          } else {
            acc[key] = [cur];
          }
          return acc;
        }, Object.create(null));
        return Object.keys(categoryMap).map((key) => {
          return {
            tag: key,
            value: categoryMap[key].length,
          }
        });
      });
    });
    if (Array.isArray(result)) {
      return res.status(200).json({
        success: true,
        message: 'get minors category count successfully',
        data: result,
      })
    }
  } catch (error) {
    next(error);
  }  
}

exports.newMinorInfo = async (req, res, next) => {
  const { create, edit } = dataControl();
  try {
    const data = { ...req.body || {} };
    const newData = {
      ...data,
      id: nanoid(16),
    }
    await create('minors', newData);
    edit('record', 'record-in', (item) => {
      const curDate = dayjs(new Date().toString()).format(FORMAT);
      const found = item.datas.find((i) => i.date === curDate);
      if (found) {
        found.value = found.value + 1;
      } else {
        item.datas.push({
          date: curDate,
          value: 1,
        });
      }
      return item;
    });
    res.status(200).json({
      success: true,
      data: {
        id: newData.id,
      },
      message: 'add new minor successfully',
    })
  } catch (error) {
    next(error);
  }
}

exports.editMinorInfo = async (req, res, next) => {
  const { edit, onError } = dataControl();
  const data = { ...req.body || {} };
  const { id } = req.query || {};
  onError(next);
  try {
    await edit('minors', id, data);
    res.status(200).json({
      success: true,
      data: {
        id,
      },
      message: 'edit minor successfully',
    });
  } catch (error) {
    next(error);
  }
}

exports.removeMinorInfo = async (req, res, next) => {
  const { id } = req.query || {};
  const { remove, edit, onError } = dataControl();
  onError(next);
  try {
    await remove('minors', id);
    edit('record', 'record-out', (item) => {
      const curDate = dayjs(new Date().toString()).format(FORMAT);
      const found = item.datas.find((i) => i.date === curDate);
      if (found) {
        found.value = found.value + 1;
      } else {
        item.datas.push({
          date: curDate,
          value: 1,
        });
      }
      return item;
    });
    res.status(200).json({
      success: true,
      data: {
        id,
      },
      message: 'remove minor successfully',
    });
  } catch (error) {
    next(error);
  }
}

exports.newPsyTestInfo = async (req, res, next) => {
  const { lookup, overwrite } = dataControl();
  const data = { ...req.body || {} };
  const { id, key } = req.query || {};
  if (id && key) {
    try {
      const finalList = await lookup('minors', (result) => {
        if (Array.isArray(result)) {
          return result;
        } else {
          return [];
        }
      });
      const finalData = finalList.find((item) => item.id === id);
      if (finalData && finalData.psyTest && finalData.psyTest[key]) {
        finalData.psyTest[key].push({
          ...data,
          id: nanoid(16),
        });
        await overwrite('minors', finalList);
        res.status(200).json({
          success: true,
          message: 'add new psy test successfully',
        })
      } else {
        res.status(400).json({
          success: false,
          message: `cannot find relative psyTest data`,
        });
      }
    } catch (error) {
      next(error);
    }
  } else {
    res.status(400).json({
      success: false,
      message: `params must include id or key`
    })
  }
}

exports.editPsyTestInfo = async (req, res, next) => {
  const { lookup, overwrite } = dataControl();
  const data = { ...req.body || {} };
  const { id, key, editId } = req.query || {};
  if (id && key && editId) {
    try {
      const finalList = await lookup('minors', (result) => {
        if (Array.isArray(result)) {
          return result;
        } else {
          return [];
        }
      });
      const finalData = finalList.find((item) => item.id === id);
      if (finalData && finalData.psyTest && finalData.psyTest[key]) {
        const index = finalData.psyTest[key].findIndex((item) => {
          return item.id === editId
        });
        if (index > -1) {
          finalData.psyTest[key][index] = {
            ...finalData.psyTest[key][index],
            ...data,
          };
          await overwrite('minors', finalList);
          res.status(200).json({
            success: true,
            message: 'add new psy test successfully',
          })
        } else {
          res.status(400).json({
            success: false,
            message: `cannot find relative editId psyTest data`,
          });
        }        
      } else {
        res.status(400).json({
          success: false,
          message: `cannot find relative id or key psyTest data`,
        });
      }
    } catch (error) {
      next(error);
    }
  } else {
    res.status(400).json({
      success: false,
      message: `params must include id or key`
    })
  }
}

exports.getInventoryInfo = async (req, res, next) => {
  const { lookup, onError } = dataControl();
  onError(next);
  try {
    const finalData = await lookup('inventory', (result) => {
      if (result && Array.isArray(result)) {
        const { searchVal } = req.body || {};
        const filter = Object.keys(req.body || {}).filter((key) => key !== 'searchVal').reduce((acc, cur) => {
          if (!acc) {
            acc = Object.create(null);
          }
          acc[cur] = req.body[cur]; 
          return acc;
        }, void 0);
        if (!filter && !searchVal) {
          return result ? result : [];
        }
        let filterdData = result;
        if (searchVal) {
          filterdData = filterdData.filter((item) => {
            return Object.keys(item).filter(i => i !== 'id').some((key) => {
              return (typeof item[key] === 'string' && item[key]) ? item[key].includes(searchVal) || searchVal.includes(item[key]) : false
            });
          });
        }
        if (filter) {
          const keys = Object.keys(filter);
          keys.forEach((key) => {
            const v = filter[key];
            if (!v) {
              return;
            }
            filterdData = filterdData.filter((item) => {
              if (typeof item[key] === 'string') {
                return item[key].includes(String(v));
              }
              if (typeof item[key] === 'number') {
                return item[key] === Number(v);
              }
              if (typeof item[key] === 'boolean') {
                return item[key] === Boolean(v);
              }
            })
          });
        }    
        return filterdData
      } else {
        return []
      }
    });  
    if (finalData) {
      res.status(200).json({
        success: true,
        data: finalData,
        message: 'get inventory successfully',
      });
    } 
  } catch(error) {
    next(error);
  }
}

exports.newInventoryInfo = async (req, res, next) => {
  const { create } = dataControl();
  try {
    const data = { ...req.body || {} };
    const newData = {
      ...data,
      id: nanoid(16),
    }
    await create('inventory', newData);
    res.status(200).json({
      success: true,
      data: {
        id: newData.id,
      },
      message: 'add new inventory successfully',
    })
  } catch (error) {
    next(error);
  }
}

exports.newSomeInventoryInfo = async (req, res, next) => {
  const { create } = dataControl();

  const data = req.body || { data: [] };
  if (!data.length) {
    return res.status(400).json({
      success: false,
      message: 'miss params data',
      data: null,
    })
  }
  const dataArr = [data].flat();
  const ids = [];
  try {
    const pushData = dataArr.map((item) => {
      const id = nanoid(16);
      ids.push(id);
      return {
        ...item,
        id
      }
    })
    await create('inventory', pushData);
  } catch (error) {
    next(error);
  }  
  res.status(200).json({
    success: true,
    data: ids,
    message: 'add new inventory successfully',
  });  
}

exports.editInventoryInfo = async (req, res, next) => {
  const { edit, onError } = dataControl();
  const data = { ...req.body || {} };
  const { id } = req.query || {};
  onError(next);
  try {
    await edit('inventory', id, data);
    res.status(200).json({
      success: true,
      data: {
        id,
      },
      message: 'edit inventory successfully',
    });
  } catch (error) {
    next(error);
  }
}

exports.removeInventoryInfo = async (req, res, next) => {
  const { id } = req.query || {};
  const { remove, onError } = dataControl();
  onError(next);
  try {
    await remove('inventory', id);
    res.status(200).json({
      success: true,
      data: {
        id,
      },
      message: 'remove inventory successfully',
    });
  } catch (error) {
    next(error);
  }
}

exports.getStreetAndCommunity = async (req, res, next) => {
  const { lookup, onError } = dataControl();
  onError(next);
  try {
    const [streets, communities] = await Promise.all([lookup('streets', (result) => result), lookup('communities', (result) => result)]);
    res.status(200).json({
      success: true,
      data: {
        streets,
        communities,
      },
      message: 'get street and community successfully'
    })
  } catch (error) {
    next(error);
  }
}

exports.getFocusArea = async (req, res, next) => {
  const { lookup, onError } = dataControl();
  onError(next);
  try {
    const areas = await lookup('focus_area', (result) => result);
    res.status(200).json({
      success: true,
      data: areas,
      message: 'get areas successfully'
    })
  } catch (error) {
    next(error);
  }
}

exports.downloadMinorInfo = async (req, res, next) => {
  const render = docxtemplate();
  const { id } = req.query || {};

  if (!id) {
    return res.status(404);
  }
  const { lookup, onError } = dataControl();
  onError(next);
  try {
    const data = await lookup('minors', (result) => result.find((i) => i.id === id));
    const streetMap = {};
    const communityMap = {};
    await lookup('streets', (result) => result.forEach((item) => {
      streetMap[item.id] = item.name;
    }));
    await lookup('communities', (result) => result.forEach((item) => {
      communityMap[item.id] = item.name;
    }))
    if (data) {
      const textData = textifyData({
        exportDate: dayjs(Date.now()).format('YYYY/MM/DD'),
        ...data,
        street: streetMap[data.street],
        community: communityMap[data.community],
      });
      const buf = render('docxtemplater.docx', textData);

      // 设置响应头
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(textData.street)}-${encodeURIComponent(textData.community)}-${encodeURIComponent(textData.name)}.docx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Length', buf.length);

      // 相应buffer
      res.send(buf);
    }
  } catch (error) {
    next(error);
  }
}

// record { id: 'record-in', datas: [ { date: '20250528', value: 123 } ] }
const getRecord = (inOrOut) => async (req, res, next) => {
  const { lookup, onError } = dataControl();
  onError(next);
  try {
    const {date} = req.body || {};
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'must have params date',
        data: null,
      });
    }
    await lookup('record', (result) => {
      const recIn = result.find((item) => item.id === `record-${inOrOut}`);
      if (recIn && recIn.datas) {
        const data = recIn.datas.find((item) => item.date === date);
        if (data) {
          return res.status(200).json({
            success: true,
            message: 'get record successfully',
            data: data.value,
          });
        } else {
          return res.status(200).json({
            success: true,
            message: 'get record successfully',
            data: 0,
          });
        }
      } else {
        return [];
      }
    })
  } catch (error) {
    next(error);
  }
}



exports.getRecordIn = getRecord('in');
exports.getRecordOut = getRecord('out');