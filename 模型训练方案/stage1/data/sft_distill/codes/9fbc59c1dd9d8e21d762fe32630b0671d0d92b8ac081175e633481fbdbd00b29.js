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
  // 在屏幕底部创建文本
  // x: 屏幕宽度的一半（水平居中）
  // y: 屏幕高度 - 30（底部留一些边距）
  const text = this.add.text(400, 570, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的原点为中心，使其真正居中显示
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);