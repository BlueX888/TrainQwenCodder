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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色星形
  
  // 绘制五角星
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 18;
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
  graphics.generateTexture('star', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建星形精灵，放置在屏幕中央
  const star = this.add.sprite(400, 300, 'star');
  star.setAlpha(0); // 初始设置为完全透明
  
  // 创建渐变动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: star,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 2500, // 持续时间 2.5 秒
    ease: 'Linear', // 线性渐变
    yoyo: true, // 来回播放（透明->不透明->透明）
    loop: -1 // 无限循环
  });
}

new Phaser.Game(config);