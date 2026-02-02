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
  // 在屏幕右侧创建文本对象
  const text = this.add.text(600, 300, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为中心，便于居中对齐
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);