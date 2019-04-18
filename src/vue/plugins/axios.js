import axios from 'axios';
// import qs from 'qs';
import { Dialog } from 'vant';
import RouterModel from '../../vue/router/index'

const instance = axios.create({
  timeout: 5000,
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : ''
});

instance.interceptors.request.use(
  config => {
    if (config.method === 'post' || config.method === 'put') {
      if (config.headers['Content-Type'] == undefined) {
        config.headers['Content-Type'] = 'application/json';
        config.data = JSON.stringify(config.data);
      }
    }
    if (!config.headers.Authorization) {
      config.headers.token = `${window.localStorage.getItem(
        'Authorization'
      ) || ''}`;
    }
    return config;
  },
  err => Promise.reject(err)
);

instance.interceptors.response.use(
  res => {
    const data = res.data;
    if (data.code == 401) {
      Dialog.alert({
        message: data.msg
      });
      RouterModel.replace({path: 'login'})
      return Promise.reject(res);
    }
    return res;
  },
  error => {
    const res = error.response;
    const data = res.data;
    switch (res.status) {
      case 401: {
        Dialog.alert({
          title: '警告',
          message: data.msg
        });
      }
    }
    return Promise.reject(error);
  }
);

const post = (url, data, config = {}) => instance.post(url, data, config);

const put = (url, data, config = {}) => instance.put(url, data, config);

const get = (url, params, config = {}) =>
  instance.get(url, {
    params,
    ...config
  });

const deleteMethod = (url, config = {}) =>
  instance({
    url,
    method: 'delete',
    ...config
  });

export default {
  install(Vue) {
    Vue.prototype.$reqGet = get;
    Vue.prototype.$reqPost = post;
    Vue.prototype.$reqPut = put;
    Vue.prototype.$reqDel = deleteMethod;
  }
};
