export default defineAppConfig({
  pages: [
    'pages/hall/index',
    'pages/record/index',
    'pages/rank/index',
    'pages/item/index',
    'pages/room/index',
    'pages/character/index',
    'pages/game/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '反应挑战',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#6366f1',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/hall/index',
        text: '大厅'
      },
      {
        pagePath: 'pages/rank/index',
        text: '排行'
      },
      {
        pagePath: 'pages/item/index',
        text: '道具'
      },
      {
        pagePath: 'pages/record/index',
        text: '战绩'
      }
    ]
  }
})
