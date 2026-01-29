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
  // 本示例不需要预加载外部资源
}

function create() {
  // 在屏幕下方创建文本
  // x: 400 (屏幕宽度的一半，居中)
  // y: 550 (接近屏幕底部，距离底部 50 像素)
  const text = this.add.text(400, 550, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为中心点，使其水平居中
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);