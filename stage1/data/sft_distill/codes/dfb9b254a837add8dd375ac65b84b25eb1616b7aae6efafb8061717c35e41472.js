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
  // 创建 Graphics 对象绘制星形
  const graphics = this.add.graphics();
  
  // 绘制粉色星形
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制五角星
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 16;
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
  graphics.generateTexture('pinkStar', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'pinkStar');
  star.setScale(2); // 放大以便观察
  
  // 创建闪烁动画 Tween
  this.tweens.add({
    targets: star,
    alpha: 0, // 目标透明度为 0（完全透明）
    duration: 750, // 0.75 秒变透明
    yoyo: true, // 往返播放（透明后再变回不透明）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 500, '粉色星形闪烁动画 (1.5秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);