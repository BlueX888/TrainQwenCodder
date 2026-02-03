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
  // 本示例不需要预加载资源
}

function create() {
  // 在屏幕左上角创建文本对象
  // 参数：x坐标, y坐标, 文本内容, 样式配置
  this.add.text(10, 10, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
}

// 启动游戏
new Phaser.Game(config);