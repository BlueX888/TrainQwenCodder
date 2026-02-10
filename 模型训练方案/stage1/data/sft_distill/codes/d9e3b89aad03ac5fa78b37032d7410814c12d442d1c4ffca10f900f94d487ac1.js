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
  // 使用 Graphics 绘制黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 60);
  
  // 生成纹理
  graphics.generateTexture('yellowRect', 60, 60);
  graphics.destroy();
  
  // 创建精灵对象，放置在左侧（留出边距）
  const rect = this.add.sprite(100, 300, 'yellowRect');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: rect,
    x: 700, // 移动到右侧（800 - 100 边距）
    duration: 4000, // 4秒
    yoyo: true, // 往返运动
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);