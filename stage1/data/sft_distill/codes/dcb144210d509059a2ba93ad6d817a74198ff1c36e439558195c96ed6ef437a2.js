const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（四个顶点连接）
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出动画
  // 从完全不透明(alpha=1)到完全透明(alpha=0)，然后返回
  this.tweens.add({
    targets: diamond,
    alpha: 0,           // 目标透明度
    duration: 500,      // 持续时间 0.5 秒
    yoyo: true,         // 反向播放（淡入）
    repeat: -1,         // 无限循环
    ease: 'Linear'      // 线性缓动
  });
}

new Phaser.Game(config);