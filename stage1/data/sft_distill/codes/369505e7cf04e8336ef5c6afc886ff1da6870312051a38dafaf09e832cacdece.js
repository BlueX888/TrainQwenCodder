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
  // 在屏幕右上角创建文本
  // x: 画布宽度 - 20 (右边距)
  // y: 20 (上边距)
  const text = this.add.text(
    this.cameras.main.width - 20,
    20,
    'Hello Phaser',
    {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  
  // 设置文本锚点为右上角 (1, 0)
  // 这样文本会从右上角开始绘制，而不是从左上角
  text.setOrigin(1, 0);
}

new Phaser.Game(config);