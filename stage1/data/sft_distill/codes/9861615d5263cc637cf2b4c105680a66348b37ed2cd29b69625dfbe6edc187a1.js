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
  // 不需要预加载外部资源
}

function create() {
  // 在屏幕左侧 (x: 50) 创建文本对象
  // y 坐标设置为画布中心位置
  const text = this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本垂直居中对齐
  text.setOrigin(0, 0.5);
}

new Phaser.Game(config);