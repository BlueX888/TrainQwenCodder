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
  // 本任务不需要预加载资源
}

function create() {
  // 在屏幕右下角创建文本
  // 位置设置为 (800, 600)，即画布的右下角坐标
  const text = this.add.text(800, 600, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为右下角 (1, 1)
  // 这样文本会以右下角为基准点对齐，确保文字显示在屏幕右下角
  text.setOrigin(1, 1);
}

// 创建并启动游戏
new Phaser.Game(config);