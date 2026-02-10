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
  // 不需要预加载外部资源
}

function create() {
  // 在屏幕右侧创建文字
  // x 坐标设置为 780（距离右边缘 20 像素）
  // y 坐标设置为屏幕中央 300
  const text = this.add.text(780, 300, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为右中心 (1, 0.5)，使文字右对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);