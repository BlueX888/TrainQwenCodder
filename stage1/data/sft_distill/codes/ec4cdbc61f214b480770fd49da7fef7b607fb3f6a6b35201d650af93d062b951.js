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
  // 在屏幕右侧显示文字
  // x 坐标设置为 780（距离右边缘 20 像素）
  // y 坐标设置为屏幕中央
  const text = this.add.text(780, 300, 'Hello Phaser', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  
  // 设置锚点为右中 (1, 0.5)，使文字右对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);