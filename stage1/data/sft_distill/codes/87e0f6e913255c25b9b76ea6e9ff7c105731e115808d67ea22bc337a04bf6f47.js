// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 本任务不需要预加载资源
}

function create() {
  // 在屏幕左上角 (10, 10) 位置创建文本
  // 设置字体大小为 24 像素，颜色为白色
  this.add.text(10, 10, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
}

// 启动游戏
new Phaser.Game(config);