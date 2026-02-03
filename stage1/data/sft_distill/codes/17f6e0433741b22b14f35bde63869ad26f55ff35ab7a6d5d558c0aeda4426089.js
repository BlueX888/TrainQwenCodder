// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 本示例不需要预加载外部资源
}

function create() {
  // 在屏幕右下角创建文本
  // 位置设置为 (800, 600) 即画布的右下角
  const text = this.add.text(800, 600, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本锚点为右下角 (1, 1)
  // 这样文本会从右下角开始绘制，而不是从左上角
  text.setOrigin(1, 1);
}

// 启动游戏
new Phaser.Game(config);