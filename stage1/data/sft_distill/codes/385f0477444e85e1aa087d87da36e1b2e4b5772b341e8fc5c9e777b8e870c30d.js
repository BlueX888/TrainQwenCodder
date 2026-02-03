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
  // 使用 Graphics 生成白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建白色方块精灵，初始位置在左侧
  const square = this.add.sprite(100, 300, 'whiteSquare');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: square,
    x: 700, // 目标 x 坐标（右侧位置）
    duration: 2000, // 持续时间 2 秒
    yoyo: true, // 启用往返效果
    repeat: -1, // 无限循环 (-1 表示永久重复)
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);