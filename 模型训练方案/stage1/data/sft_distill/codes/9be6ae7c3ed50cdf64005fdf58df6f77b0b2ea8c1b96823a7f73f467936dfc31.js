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
  // 位置：x=20 (距左边 20 像素), y=580 (距顶部 580 像素，即距底部 20 像素)
  const text = this.add.text(20, 580, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为左下角 (0, 1)
  // 这样文本就会以左下角为锚点进行定位
  text.setOrigin(0, 1);
}

new Phaser.Game(config);