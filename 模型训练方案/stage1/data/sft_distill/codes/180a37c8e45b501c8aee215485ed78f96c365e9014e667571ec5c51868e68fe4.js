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
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制星形（5个点）
  // 星形中心点为 (64, 64)，外半径 60，内半径 30
  const centerX = 64;
  const centerY = 64;
  const outerRadius = 60;
  const innerRadius = 30;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 128, 128);
  graphics.destroy();
  
  // 创建星形精灵并放置在屏幕中央
  const star = this.add.sprite(400, 300, 'starTexture');
  
  // 设置初始 alpha 为 0（完全透明）
  star.setAlpha(0);
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入后自动淡出
  // repeat: -1 实现无限循环
  this.tweens.add({
    targets: star,
    alpha: 1,              // 目标 alpha 值为 1（完全不透明）
    duration: 250,         // 淡入时间 0.25 秒
    yoyo: true,            // 启用 yoyo 效果，到达目标后反向播放（淡出）
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加说明文字
  this.add.text(400, 500, '红色星形淡入淡出循环动画 (0.5秒/周期)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);