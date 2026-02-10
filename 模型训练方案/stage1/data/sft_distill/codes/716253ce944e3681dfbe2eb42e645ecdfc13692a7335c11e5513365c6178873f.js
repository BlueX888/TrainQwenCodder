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
  // 创建文本对象，设置位置在屏幕中心
  const text = this.add.text(400, 300, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的原点为中心，使其居中显示
  text.setOrigin(0.5, 0.5);
}

// 创建游戏实例
new Phaser.Game(config);