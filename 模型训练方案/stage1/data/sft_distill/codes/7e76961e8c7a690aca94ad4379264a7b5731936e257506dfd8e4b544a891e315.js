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
  // 方法1: 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 绘制星形路径
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.beginPath();
  
  // 星形中心点
  const centerX = 400;
  const centerY = 300;
  const outerRadius = 80;
  const innerRadius = 40;
  const points = 5;
  
  // 绘制五角星
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
  
  // 设置初始透明度为 0
  graphics.setAlpha(0);
  
  // 创建补间动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: graphics,
    alpha: 1,              // 目标透明度为 1（完全不透明）
    duration: 1000,        // 持续时间 1 秒
    ease: 'Linear',        // 线性缓动
    yoyo: true,           // 来回播放（透明->不透明->透明）
    repeat: -1            // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Star fading in and out (1 second cycle)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);