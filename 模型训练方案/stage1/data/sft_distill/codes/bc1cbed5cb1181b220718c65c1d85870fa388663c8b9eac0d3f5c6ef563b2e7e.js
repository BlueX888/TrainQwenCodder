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
  // 创建绿色方块精灵，放置在左侧
  const square = this.add.sprite(100, 300, 'greenSquare');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: square,           // 动画目标对象
    x: 700,                    // 目标 x 坐标（右侧位置）
    duration: 1000,            // 动画持续时间 1 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    loopDelay: 0               // 循环延迟为 0（立即开始下一次循环）
  });
  
  // 添加提示文字
  this.add.text(400, 50, '绿色方块左右往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);