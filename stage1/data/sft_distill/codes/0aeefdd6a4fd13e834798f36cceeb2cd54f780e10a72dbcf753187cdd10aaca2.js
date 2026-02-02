// 完整的 Phaser3 代码 - 在屏幕左下显示文字
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
  // 无需预加载资源
}

function create() {
  // 在屏幕左下角创建文本
  // x: 20 距离左边界 20 像素
  // y: 600 - 20 = 580 距离底部 20 像素
  const text = this.add.text(20, this.scale.height - 20, 'Hello Phaser', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  
  // 设置原点为左下角 (0, 1)
  // 0 表示水平方向在最左边，1 表示垂直方向在最底部
  text.setOrigin(0, 1);
}

// 启动游戏
new Phaser.Game(config);