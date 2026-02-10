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
  // 在屏幕右侧显示文字
  // x 坐标设置为 750（距离右边缘 50 像素）
  // y 坐标设置为屏幕中央
  const text = this.add.text(750, 300, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字原点为右中，使其右对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);