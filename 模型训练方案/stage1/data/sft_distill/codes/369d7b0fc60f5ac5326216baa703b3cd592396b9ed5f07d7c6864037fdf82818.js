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
  // 创建文本对象
  const text = this.add.text(0, 0, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为中心点，便于居中定位
  text.setOrigin(0.5, 0.5);
  
  // 将文本定位到屏幕下方中央
  // x: 屏幕宽度的一半（水平居中）
  // y: 屏幕高度 - 80 像素（距离底部有一定间距）
  text.setPosition(this.cameras.main.width / 2, this.cameras.main.height - 80);
}

new Phaser.Game(config);