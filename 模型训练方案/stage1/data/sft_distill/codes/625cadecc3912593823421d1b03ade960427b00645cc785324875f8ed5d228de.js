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
  // 本示例不需要预加载资源
}

function create() {
  // 在屏幕左侧显示文字
  // x: 50 表示距离左边 50 像素
  // y: 300 表示垂直居中
  const text = this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字垂直居中对齐
  text.setOrigin(0, 0.5);
}

// 启动游戏
new Phaser.Game(config);