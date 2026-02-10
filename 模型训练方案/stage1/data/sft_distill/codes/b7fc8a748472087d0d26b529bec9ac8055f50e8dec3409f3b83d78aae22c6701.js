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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制六边形（中心点为 50, 50，半径为 40）
  const hexRadius = 40;
  const centerX = 50;
  const centerY = 50;
  const sides = 6;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 六边形每个角 60 度
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy();
  
  // 创建 Sprite 对象
  const hexagon = this.add.sprite(400, 200, 'hexagon');
  
  // 创建弹跳动画 Tween
  this.tweens.add({
    targets: hexagon,
    y: 400, // 从 200 弹跳到 400
    duration: 1500, // 1.5 秒
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 来回弹跳
    repeat: -1, // 无限循环
    hold: 0 // 到达目标点后立即返回
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Green Hexagon Bouncing Animation', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);