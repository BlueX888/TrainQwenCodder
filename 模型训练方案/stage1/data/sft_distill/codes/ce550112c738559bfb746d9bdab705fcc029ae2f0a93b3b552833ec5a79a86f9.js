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
  // 无需预加载外部资源
}

function create() {
  // 方法1：使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  
  // 绘制星形（5个顶点）
  const centerX = 100;
  const centerY = 300;
  const outerRadius = 40;
  const innerRadius = 20;
  const points = 5;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
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
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: graphics,
    x: 700 - 100, // 移动到右侧（总宽度800，减去初始位置100，再减去星形宽度）
    duration: 1500, // 1.5秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环
    ease: 'Linear' // 线性移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '红色星形左右往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '循环次数：无限 | 单程时长：1.5秒', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);