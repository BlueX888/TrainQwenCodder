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
  
  // 绘制一个黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 星形的参数
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 20;
  const points = 5;
  
  // 开始绘制星形路径
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
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵并放置在屏幕中心
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,
    scaleX: 0.64,
    scaleY: 0.64,
    duration: 500,        // 0.5 秒
    yoyo: true,           // 自动恢复到原始大小
    repeat: -1,           // 无限循环
    ease: 'Linear'        // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Star scaling animation (64% - 100%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);