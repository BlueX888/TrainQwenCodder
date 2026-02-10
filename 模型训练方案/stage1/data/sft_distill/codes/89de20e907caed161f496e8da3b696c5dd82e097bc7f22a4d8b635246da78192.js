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
  // 使用 Graphics 创建粉色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制粉色星形
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.lineStyle(2, 0xff1493, 1); // 深粉色描边
  
  // 绘制五角星
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 18;
  const points = 5;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
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
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵对象
  const star = this.add.image(400, 300, 'star');
  star.setScale(2); // 放大2倍使其更明显
  
  // 创建闪烁动画（使用 Tween 控制透明度）
  this.tweens.add({
    targets: star,
    alpha: { from: 1, to: 0 }, // 从完全不透明到完全透明
    duration: 750, // 0.75秒变暗
    yoyo: true, // 往返动画（变暗后再变亮）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '粉色星形闪烁动画\n1.5秒循环', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);