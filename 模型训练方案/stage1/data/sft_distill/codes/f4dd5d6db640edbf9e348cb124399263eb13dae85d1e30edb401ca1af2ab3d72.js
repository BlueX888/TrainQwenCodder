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
  // 创建文字对象，位置设置在屏幕右下角
  const text = this.add.text(
    this.scale.width - 20,  // x 坐标：画布宽度 - 右边距
    this.scale.height - 20, // y 坐标：画布高度 - 下边距
    'Hello Phaser',
    {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  
  // 设置文字原点为右下角 (1, 1)，使文字从右下角对齐
  text.setOrigin(1, 1);
}

new Phaser.Game(config);