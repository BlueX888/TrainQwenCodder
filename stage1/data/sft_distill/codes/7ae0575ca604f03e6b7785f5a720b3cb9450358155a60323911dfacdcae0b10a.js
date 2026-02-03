const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色星形
  const graphics = this.add.graphics();
  
  // 绘制星形的函数
  const drawStar = (graphics, cx, cy, spikes, outerRadius, innerRadius, color) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;
      
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }
    
    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
  };
  
  // 绘制蓝色星形（中心在 100, 100 位置，方便生成纹理）
  drawStar(graphics, 100, 100, 5, 80, 40, 0x4169E1);
  
  // 生成纹理
  graphics.generateTexture('blueStar', 200, 200);
  
  // 清除 graphics 对象（已经生成纹理，不再需要）
  graphics.destroy();
  
  // 创建星形图像对象，放置在屏幕中心
  const star = this.add.image(400, 300, 'blueStar');
  
  // 创建旋转动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    rotation: Math.PI * 2,   // 旋转 360 度（2π 弧度）
    duration: 2000,          // 持续时间 2 秒
    ease: 'Linear',          // 线性缓动，匀速旋转
    repeat: -1,              // 无限循环（-1 表示永久重复）
    yoyo: false              // 不回放，直接循环
  });
  
  // 添加提示文本
  this.add.text(400, 550, '蓝色星形旋转动画 - 2秒一圈', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);