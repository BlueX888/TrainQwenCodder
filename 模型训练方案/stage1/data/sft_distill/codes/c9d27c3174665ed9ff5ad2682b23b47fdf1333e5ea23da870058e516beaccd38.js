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
  // 使用 Graphics 绘制黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 60); // 60x60 的矩形
  
  // 生成纹理
  graphics.generateTexture('yellowRect', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象，放置在左侧中央
  const rect = this.add.sprite(100, 300, 'yellowRect');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: rect,
    x: 700, // 移动到右侧（800 - 100 = 700）
    duration: 1000, // 1秒
    yoyo: true, // 往返效果（到达终点后反向播放）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);