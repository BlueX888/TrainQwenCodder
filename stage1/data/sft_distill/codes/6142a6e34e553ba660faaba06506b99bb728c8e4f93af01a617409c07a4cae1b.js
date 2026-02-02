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
  // 在屏幕左下角创建文本
  // x: 20 (距离左边 20 像素)
  // y: 600 - 50 = 550 (距离底部 50 像素)
  const text = this.add.text(20, 550, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为左下角，使定位更精确
  text.setOrigin(0, 1);
}

new Phaser.Game(config);