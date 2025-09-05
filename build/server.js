const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');
const os = require('os'); // 引入os模块获取网络信息
const cors = require('cors');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: envPath });

const fileRoutes = require('./routes/fileRoutes');
const commons = require('./routes/common');
const datas = require('./routes/data');
const auths = require('./routes/auth');
const { errorHandler } = require('./utils/errorHandler');
const app = express();
const PORT = process.env.PORT || 443; // HTTPS默认端口

const getStaticIndexHtml = (req, res) => {
  const indexPath = path.join(__dirname, 'static', 'index.html');
  
  // 检查文件是否存在
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('index.html文件不存在，请确保它位于static目录下');
    }
    res.sendFile(indexPath);
  });
};

// 配置静态文件服务
app.use(express.static(path.join(__dirname, '/static/')));

// 配置cors
app.use(cors());

app.use(express.json());
app.use('/api/common', commons);
app.use('/api/data', datas);
app.use('/api/files', fileRoutes);
app.use('/api/auth', auths);

// 通配符路由 - 所有未匹配的GET请求返回index.html
app.get(/^((?!\.(js|css|png|jpg|jpeg|gif|ico|svg|json|woff|woff2|ttf|eot|map)$).)*$/, getStaticIndexHtml);
app.use(errorHandler);

// 获取本地IP地址的函数
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (const alias of iface) {
      // 筛选IPv4、非回环地址、已启用的网络接口
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1'; //  fallback to localhost if no IP found
}

// 加载SSL证书
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/domain.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/domain.crt'))
};

// 创建HTTPS服务器
const server = https.createServer(options, app)
server.listen(PORT, () => {
  const localIp = getLocalIP();
  console.log(`HTTPS服务器运行在: https://${localIp}:${PORT}`);
  console.log(`静态文件根目录: ${path.join(__dirname, '/static/')}`);
});