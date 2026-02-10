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
  // 使用 Graphics 绘制橙色菱形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFF8C00, 1);
  
  // 绘制菱形（四个顶点）
  const size = 60;
  graphics.beginPath();
  graphics.moveTo(size, 0);           // 上顶点
  graphics.lineTo(size * 2, size);    // 右顶点
  graphics.lineTo(size, size * 2);    // 下顶点
  graphics.lineTo(0, size);           // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建闪烁动画
  // 使用 yoyo 实现从1→0→1的效果
  this.tweens.add({
    targets: diamond,
    alpha: 0,              // 目标透明度为0（完全透明）
    duration: 1500,        // 1.5秒变透明
    yoyo: true,            // 反向播放（透明后再变回不透明）
    repeat: -1,            // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动使过渡更自然
  });
  
  // 添加说明文字
  this.add.text(400, 500, '橙色菱形闪烁动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);