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
  // 在屏幕左侧 (x: 50) 创建文本
  // y: 300 使其垂直居中
  const text = this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的原点，使其更好地定位
  text.setOrigin(0, 0.5);
}

// 启动游戏
new Phaser.Game(config);