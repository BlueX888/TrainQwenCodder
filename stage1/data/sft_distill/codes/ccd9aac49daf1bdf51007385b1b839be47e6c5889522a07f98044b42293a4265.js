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
  // 在屏幕右侧创建文本
  // x 坐标设置为画布宽度减去一些边距（例如 50 像素）
  // y 坐标设置为画布中心
  const text = this.add.text(750, 300, 'Hello Phaser', {
    fontSize: '80px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  
  // 设置文本原点为右中心 (1, 0.5)
  // 这样文本会从右侧对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);