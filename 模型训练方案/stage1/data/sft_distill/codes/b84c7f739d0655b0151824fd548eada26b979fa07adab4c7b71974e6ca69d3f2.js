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
  // 无需预加载资源
}

function create() {
  // 在左下角创建文本对象
  // 位置：左边距 20px，底部距离 20px
  const text = this.add.text(20, 580, 'Hello Phaser', {
    fontSize: '80px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为左下角 (0, 1)
  // 这样文本的左下角会对齐到指定的坐标点
  text.setOrigin(0, 1);
}

new Phaser.Game(config);