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
  // 创建文字对象
  const text = this.add.text(
    this.cameras.main.width,  // x 坐标：屏幕右边缘
    0,                         // y 坐标：屏幕顶部
    'Hello Phaser',           // 文字内容
    {
      fontSize: '64px',       // 字体大小
      fill: '#ffffff',        // 文字颜色（白色）
      fontFamily: 'Arial'     // 字体
    }
  );

  // 设置锚点为右上角 (1, 0)，使文字从右上角开始绘制
  text.setOrigin(1, 0);

  // 添加一些内边距，避免文字紧贴边缘
  text.setPosition(this.cameras.main.width - 20, 20);
}

new Phaser.Game(config);