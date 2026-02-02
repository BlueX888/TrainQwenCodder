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
  // 在屏幕右下角创建文字
  // 位置设置为 (800, 600) 即画布的右下角
  const text = this.add.text(800, 600, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为右下角 (1, 1)
  // 这样文字会从右下角开始对齐，而不是默认的左上角
  text.setOrigin(1, 1);
}

new Phaser.Game(config);