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
  // 本示例不需要预加载外部资源
}

function create() {
  // 在屏幕左下角创建文字
  // x: 20 表示距离左边 20 像素
  // y: 580 表示距离顶部 580 像素（600 - 20）
  const text = this.add.text(20, 580, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置原点为左下角 (0, 1)
  // 0 表示水平方向左对齐，1 表示垂直方向底部对齐
  text.setOrigin(0, 1);
}

// 启动游戏
new Phaser.Game(config);