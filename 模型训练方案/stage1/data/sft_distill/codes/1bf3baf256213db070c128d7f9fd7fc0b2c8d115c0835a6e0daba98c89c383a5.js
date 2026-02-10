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
  // 在屏幕右侧创建文字
  // x: 750 (屏幕宽度 800 - 50 边距)
  // y: 300 (屏幕中央垂直位置)
  const text = this.add.text(750, 300, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置原点为右中，使文字右对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);