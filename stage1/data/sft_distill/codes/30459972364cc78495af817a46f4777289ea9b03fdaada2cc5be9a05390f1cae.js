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
  // 使用 Graphics 绘制红色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 60, 60);
  graphics.generateTexture('redRect', 60, 60);
  graphics.destroy();

  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'redRect');

  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 3000,          // 持续时间 3 秒
    yoyo: true,              // 往返效果（到达终点后反向播放）
    loop: -1,                // 无限循环（-1 表示永久循环）
    ease: 'Linear'           // 线性缓动函数，匀速移动
  });

  // 添加文字说明
  this.add.text(400, 50, '红色矩形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '3秒完成一次单程，自动往返循环', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);