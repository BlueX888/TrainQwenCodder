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
  // 在屏幕右侧创建文字对象
  // x: 750 (距离右边缘 50 像素)
  // y: 300 (垂直居中)
  const text = this.add.text(750, 300, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字原点为右中心点 (1, 0.5)
  // 这样文字会以右侧为锚点进行定位
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);