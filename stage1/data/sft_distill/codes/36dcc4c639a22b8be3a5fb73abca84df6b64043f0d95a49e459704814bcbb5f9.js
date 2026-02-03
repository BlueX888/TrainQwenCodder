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
  // 使用 Graphics 绘制白色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 80, 60);
  
  // 生成纹理
  graphics.generateTexture('whiteRect', 80, 60);
  graphics.destroy();
  
  // 创建矩形精灵，放置在左侧起始位置
  const rect = this.add.sprite(100, 300, 'whiteRect');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: rect,
    x: 700, // 目标 x 坐标（右侧位置）
    duration: 3000, // 3秒
    yoyo: true, // 往返效果（到达终点后返回起点）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);