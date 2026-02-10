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
  // 使用 Graphics 绘制一个方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建 Sprite 并设置位置
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);
  
  // 创建 Tween 动画：4 秒内从透明到不透明，循环播放
  this.tweens.add({
    targets: square,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 4000, // 持续时间 4 秒
    ease: 'Linear', // 线性渐变
    loop: -1, // 无限循环
    yoyo: false // 不回放，只从 0 到 1 循环
  });
  
  // 添加文字提示
  this.add.text(400, 500, '方块将在 4 秒内从透明变为不透明（循环）', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);