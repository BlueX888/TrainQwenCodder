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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点在 64, 64，边长约 100）
  graphics.beginPath();
  graphics.moveTo(64, 14);      // 上顶点
  graphics.lineTo(114, 64);     // 右顶点
  graphics.lineTo(64, 114);     // 下顶点
  graphics.lineTo(14, 64);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  graphics.destroy();
  
  // 创建菱形 Sprite 并放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  // 从原始大小 (scale: 1) 缩放到 16% (scale: 0.16)
  // 使用 yoyo 实现缩小后恢复
  // duration 为 1500ms (1.5秒)，yoyo 会让整个动画时长为 3秒（1.5秒缩小 + 1.5秒恢复）
  this.tweens.add({
    targets: diamond,
    scale: 0.16,           // 目标缩放值 16%
    duration: 1500,        // 单程时长 1.5 秒
    yoyo: true,            // 启用往返效果（缩小后恢复）
    loop: -1,              // 无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Diamond scaling animation (1 -> 0.16 -> 1) in 1.5s each way', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);