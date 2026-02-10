const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制星形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制星形（五角星）
  const starPoints = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = 60 + Math.cos(angle) * radius;
    const y = 60 + Math.sin(angle) * radius;
    starPoints.push(x, y);
  }
  
  graphics.fillPoints(starPoints, true);
  
  // 生成纹理
  graphics.generateTexture('pinkStar', 120, 120);
  graphics.destroy();
  
  // 创建星形精灵并居中
  const star = this.add.sprite(400, 300, 'pinkStar');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,
    scaleX: 1.5,
    scaleY: 1.5,
    duration: 750, // 放大阶段 0.75 秒
    yoyo: true,    // 自动反向播放（缩小回原大小）
    repeat: -1,    // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Pink Star Scaling Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);