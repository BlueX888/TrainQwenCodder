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
  // 创建文本对象，显示 "Hello Phaser"
  const text = this.add.text(400, 300, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为中心，使其居中显示
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);