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
  // 使用 Graphics 绘制红色星形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  
  // 绘制星形的路径
  const points = 5; // 五角星
  const outerRadius = 50;
  const innerRadius = 20;
  const centerX = 50;
  const centerY = 50;
  
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
  
  // 生成纹理
  graphics.generateTexture('redStar', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建星形精灵，放置在屏幕中央
  const star = this.add.sprite(400, 300, 'redStar');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    alpha: 0,                // 目标透明度（从1淡出到0）
    duration: 500,           // 持续时间 0.5 秒
    yoyo: true,              // 反向播放（淡出后再淡入）
    repeat: -1,              // 无限循环 (-1 表示永久重复)
    ease: 'Linear'           // 线性缓动
  });
}

new Phaser.Game(config);