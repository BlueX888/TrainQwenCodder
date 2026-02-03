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
  // 在屏幕右侧创建文字
  // x 坐标设置为 750（距离右边缘 50 像素）
  // y 坐标设置为屏幕中央 300
  const text = this.add.text(750, 300, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字锚点为右中心 (1, 0.5)
  // 这样文字会以右边缘为基准对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);