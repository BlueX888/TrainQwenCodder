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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色星形
  
  // 绘制五角星
  const centerX = 64;
  const centerY = 64;
  const outerRadius = 50;
  const innerRadius = 20;
  const points = 5;
  
  const path = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    path.push(new Phaser.Geom.Point(x, y));
  }
  
  graphics.fillPoints(path, true);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中央
  const star = this.add.sprite(400, 300, 'star');
  
  // 设置初始透明度为 0（完全透明）
  star.setAlpha(0);
  
  // 创建透明度渐变补间动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    alpha: 1,                // 目标透明度：完全不透明
    duration: 2500,          // 持续时间：2.5 秒（2500 毫秒）
    ease: 'Linear',          // 线性缓动
    repeat: -1,              // 无限循环
    yoyo: true               // 往返播放（透明→不透明→透明）
  });
}

new Phaser.Game(config);