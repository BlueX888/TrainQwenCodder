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
  // 在屏幕右下角创建文本
  const text = this.add.text(800, 600, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置锚点为右下角 (1, 1)，使文本右下角对齐到坐标点
  text.setOrigin(1, 1);
}

new Phaser.Game(config);