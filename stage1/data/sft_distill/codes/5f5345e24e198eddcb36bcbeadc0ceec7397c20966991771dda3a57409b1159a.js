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
  // 使用 Graphics 创建绿色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('greenSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建绿色方块精灵，初始位置在左侧
  const square = this.add.sprite(100, 300, 'greenSquare');
  
  // 创建补间动画：从左移动到右，1秒完成
  this.tweens.add({
    targets: square,
    x: 700,              // 目标 x 坐标（右侧位置）
    duration: 1000,      // 持续时间 1 秒
    ease: 'Linear',      // 线性缓动
    yoyo: true,          // 启用往返效果（到达终点后反向回到起点）
    loop: -1             // 无限循环（-1 表示永远循环）
  });
  
  // 添加提示文本
  this.add.text(400, 50, '绿色方块左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);