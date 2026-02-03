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
  // 无需预加载外部资源
}

function create() {
  // 在屏幕左下角创建文本
  // x: 10 像素距离左边
  // y: 600 - 20 = 580 像素，距离底部 20 像素
  const text = this.add.text(10, 580, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为左下角，使定位更精确
  text.setOrigin(0, 1);
}

// 启动游戏
new Phaser.Game(config);