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
  // 在屏幕右下角创建文本
  // 位置设置为 (780, 580)，留出 20 像素的边距
  const text = this.add.text(780, 580, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为右下角 (1, 1)
  // 这样文本会从右下角开始对齐，而不是从左上角
  text.setOrigin(1, 1);
}

new Phaser.Game(config);