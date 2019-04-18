import asyncLoader from 'core/async-loader';

const publish = asyncLoader('publish/publish');

const Tabbar = () =>
  import(/* webpackChunkName: "Tabbar" */ '@/vue/components/Tabbar/');

export default [
  {
    path: '/publish',
    name: 'publish',
    meta: {
      keepAlive: true
    },
    components: { default: publish, tabbar: Tabbar }
  }
];
