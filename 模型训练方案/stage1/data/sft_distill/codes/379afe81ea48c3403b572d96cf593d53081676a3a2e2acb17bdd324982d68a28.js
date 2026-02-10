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
  // 使用 Graphics 绘制白色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 60, 40);
  graphics.generateTexture('whiteRect', 60, 40);
  graphics.destroy();

  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'whiteRect');

  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 1000,          // 持续时间 1 秒
    yoyo: true,              // 启用往返效果（到达目标后反向运动）
    loop: -1,                // 无限循环（-1 表示永久循环）
    ease: 'Linear'           // 线性缓动函数，匀速运动
  });

  // 添加提示文本
  this.add.text(400, 100, '白色矩形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);