// 完整的 Phaser3 代码 - 显示 "Hello Phaser" 文字
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
  // 本示例不需要预加载任何资源
}

function create() {
  // 在屏幕中央创建文本对象
  const text = this.add.text(400, 300, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的原点为中心，使其在指定坐标居中显示
  text.setOrigin(0.5, 0.5);
}

// 创建并启动游戏实例
new Phaser.Game(config);