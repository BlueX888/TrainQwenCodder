const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建一个方块 Graphics 对象
  const square = this.add.graphics();
  
  // 设置填充颜色为蓝色
  square.fillStyle(0x00aaff, 1);
  
  // 绘制一个 100x100 的方块，位置在屏幕中心
  const squareSize = 100;
  const x = (this.cameras.main.width - squareSize) / 2;
  const y = (this.cameras.main.height - squareSize) / 2;
  square.fillRect(x, y, squareSize, squareSize);
  
  // 设置初始 alpha 为 0（完全透明）
  square.alpha = 0;
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: square,
    alpha: 1,              // 目标 alpha 值为 1（完全不透明）
    duration: 1500,        // 持续时间 1.5 秒
    yoyo: true,            // 来回播放（1->0->1）
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加文本提示
  this.add.text(
    this.cameras.main.width / 2,
    50,
    'Square Fade Animation',
    {
      fontSize: '24px',
      color: '#ffffff'
    }
  ).setOrigin(0.5);
}

new Phaser.Game(config);