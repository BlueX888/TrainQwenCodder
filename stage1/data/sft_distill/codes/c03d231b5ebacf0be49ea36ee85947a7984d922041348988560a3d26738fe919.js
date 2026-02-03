// 完整的 Phaser3 代码
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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteSquare', 50, 50);
  graphics.destroy();

  // 创建方块精灵，初始位置在左侧
  const square = this.add.sprite(100, 300, 'whiteSquare');

  // 创建补间动画：从左到右移动，1秒完成，往返循环
  this.tweens.add({
    targets: square,
    x: 700, // 目标 x 坐标（右侧）
    duration: 1000, // 动画时长 1 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果（到达终点后反向播放）
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
}

// 启动游戏
new Phaser.Game(config);