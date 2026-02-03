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
  // 创建文字对象，位置设置在右上角
  // x: 780 (距离右边界 20px)
  // y: 20 (距离上边界 20px)
  const text = this.add.text(780, 20, 'Hello Phaser', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  
  // 设置原点为右上角 (1, 0)，使文字右对齐
  // 这样文字会从设定的坐标点向左延伸，确保不会超出画布边界
  text.setOrigin(1, 0);
}

new Phaser.Game(config);