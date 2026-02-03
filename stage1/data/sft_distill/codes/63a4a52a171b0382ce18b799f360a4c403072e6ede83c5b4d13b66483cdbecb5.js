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
  // 无需预加载资源
}

function create() {
  // 在屏幕左下角显示文字
  // x: 10 像素距离左边
  // y: 600 - 40 = 560 像素，距离底部约 40 像素
  const text = this.add.text(10, 560, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字原点为左下角，使定位更精确
  text.setOrigin(0, 1);
}

new Phaser.Game(config);