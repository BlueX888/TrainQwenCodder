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
  // 使用 Graphics 绘制黄色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 40); // 绘制 60x40 的矩形
  graphics.generateTexture('yellowRect', 60, 40);
  graphics.destroy();

  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'yellowRect');

  // 创建补间动画：从左移动到右，然后往返循环
  this.tweens.add({
    targets: rect,
    x: 700, // 目标 x 坐标（屏幕右侧）
    duration: 2500, // 持续时间 2.5 秒
    yoyo: true, // 启用往返效果（到达终点后反向播放）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });

  // 添加提示文本
  this.add.text(10, 10, 'Yellow rectangle moving left-right in 2.5s loop', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);