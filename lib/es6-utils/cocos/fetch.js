/* global ActiveXObject */
import querystring from 'querystring';
import cfg from '../../constants';

class Response {
  constructor(body, opts) {
    this.body = body;
    this.status = opts.status;
    this.ok = this.status >= 200 && this.status <= 207;
    this.spendTime = opts.spendTime;
  }

  json() {
    return JSON.parse(this.body);
  }
}

function getXHR() {
  return cc.loader.getXMLHttpRequest();
}

/**
 * *** urlEncode ***
 * param 将要转为URL参数字符串的对象
 * key URL参数字符串的前缀
 * encode true/false 是否进行URL编码,默认为true
 *
 * return URL参数字符串
 */
// function urlEncode(param, key, encode) {
//   if (param === null) return '';
//   let paramStr = '';
//   const type = typeof (param);
//   if (type === 'string' || type === 'number' || type === 'boolean') {
//     paramStr += '&' + key + '=' + ((encode === null || encode) ? encodeURIComponent(param) : param);
//   } else {
//     for (const i in param) {
//       if (param.hasOwnProperty(i)) {
//         const kk = !key ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
//         paramStr += urlEncode(param[i], kk, encode);
//       }
//     }
//   }
//   return paramStr;
// }

/**
 * options:
 *   method - 'GET', 'POST'
 *   body - POST的时候传入的是object
 *   timeout - 有这个参数的时候才会有超时机制
 */
function fetchFuc(url, { method = 'GET', timeout = null, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = getXHR();

    const startTime = new Date().valueOf();
    let reqTimeout = null;
    if (timeout) {
      reqTimeout = setTimeout(() => {
        xhr.abort();
        reject(new Error('network_timeout'));
      }, timeout);
    }

    function onReady() {
      if (xhr.readyState === 4) {
        clearTimeout(reqTimeout);
        if ((xhr.status >= 200 && xhr.status <= 207)) {
          const spendTime = new Date().valueOf() - startTime;
          resolve(new Response(xhr.responseText, { status: xhr.status, spendTime }));
        } else {
          reject(new Error('request to ' + url + ' failed, statusText: ' + xhr.statusText));
        }
      }
    }

    xhr.onreadystatechange = onReady;
    if (method === 'GET') {
      xhr.open(method, url, true);
      xhr.setRequestHeader('Accept-Encoding', 'gzip,deflate');
      xhr.send();
    } else if (method === 'POST') {
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      // xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      // xhr.send(JSON.stringify(body));
      const data = querystring.stringify(body);
      // const data = urlEncode(body);
      // console.log('body : ' + JSON.stringify(body));
      // console.log('data : ' + data);
      xhr.send(data);
    }
  });
}

function fetch(gain, cb) {
  const dt = {};
  dt.method = 'POST';
  dt.body = gain;
  dt.timeout = gain.timeout || 10000;
  fetchFuc(cfg.svrUrl, dt).then(response => {
    if (cb) {
      const result = response.json();
      if ( Number(result.code) !== 0 ) {
        cb(result.msg, result);
      } else {
        cb(null, result);
      }
    }
  }).catch(err => {
    console.error(' err : ' + err);
    const er = '' + err;
    if (cb) {
      cb(er);
    }
  });
}


export default fetch;
