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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
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
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  star.setOrigin(0.5, 0.5);
  
  // 创建缩放动画
  // 使用 yoyo 实现缩放到16%后恢复
  this.tweens.add({
    targets: star,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 1500, // 1.5秒
    ease: 'Sine.easeInOut',
    yoyo: true, // 自动反向播放（恢复到原始大小）
    loop: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 550, 'Star scaling animation: 100% → 16% → 100% (loop)', {
    fontSize: '18px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);