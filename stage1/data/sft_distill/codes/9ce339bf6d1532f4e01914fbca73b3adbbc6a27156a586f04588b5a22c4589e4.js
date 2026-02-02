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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充样式
  graphics.fillStyle(0x00ff00, 1);
  
  // 六边形参数
  const centerX = 0;
  const centerY = 0;
  const radius = 80;
  const sides = 6;
  
  // 绘制六边形
  graphics.beginPath();
  
  for (let i = 0; i < sides; i++) {
    // 计算每个顶点的角度（从顶部开始，所以偏移 -90 度）
    const angle = Phaser.Math.DegToRad((360 / sides) * i - 90);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 设置六边形位置到屏幕中心
  graphics.setPosition(400, 300);
  
  // 创建缩放动画
  // yoyo: true 使动画在完成后反向播放（恢复原状）
  // duration: 1250 表示单程时间，来回总共 2500ms = 2.5 秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: graphics,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 1250,
    yoyo: true,
    loop: -1,
    ease: 'Linear'
  });
}

new Phaser.Game(config);