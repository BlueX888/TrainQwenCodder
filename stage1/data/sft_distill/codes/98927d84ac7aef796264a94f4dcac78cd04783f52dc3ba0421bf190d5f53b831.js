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
  // 在屏幕右下角创建文字
  const text = this.add.text(
    this.game.config.width,  // x 坐标：屏幕右边缘
    this.game.config.height, // y 坐标：屏幕下边缘
    'Hello Phaser',          // 文字内容
    {
      fontSize: '16px',      // 字体大小
      color: '#ffffff',      // 文字颜色（白色）
      fontFamily: 'Arial'    // 字体系列
    }
  );
  
  // 设置锚点为右下角 (1, 1)，使文字从右下角对齐
  text.setOrigin(1, 1);
}

new Phaser.Game(config);