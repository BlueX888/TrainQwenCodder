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
  // 创建文本对象，设置初始位置和样式
  const text = this.add.text(400, 550, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的原点为中心点，使其居中显示
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);