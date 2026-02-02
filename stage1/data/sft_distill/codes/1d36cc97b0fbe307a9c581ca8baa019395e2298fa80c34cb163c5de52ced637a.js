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
  // 使用 Graphics 绘制绿色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（四个顶点）
  const size = 50;
  graphics.beginPath();
  graphics.moveTo(size, 0);        // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: diamond,
    alpha: 0,              // 目标透明度为 0（完全透明）
    duration: 500,         // 持续时间 0.5 秒
    yoyo: true,           // 反向播放（淡入后淡出）
    repeat: -1,           // 无限循环
    ease: 'Linear'        // 线性缓动
  });
}

new Phaser.Game(config);