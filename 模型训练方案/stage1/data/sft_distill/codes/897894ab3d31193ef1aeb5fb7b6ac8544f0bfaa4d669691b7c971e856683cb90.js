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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 150, 100);
  
  // 生成纹理
  graphics.generateTexture('yellowRect', 150, 100);
  graphics.destroy();
  
  // 创建精灵对象并居中
  const rect = this.add.sprite(400, 300, 'yellowRect');
  
  // 创建淡入淡出动画
  // 从完全不透明(alpha=1)到完全透明(alpha=0)，然后返回
  this.tweens.add({
    targets: rect,
    alpha: 0,           // 目标透明度为0（完全透明）
    duration: 1000,     // 动画持续1秒
    yoyo: true,         // 动画结束后反向播放（淡入）
    repeat: -1,         // 无限循环 (-1表示永久重复)
    ease: 'Linear'      // 线性缓动
  });
}

new Phaser.Game(config);