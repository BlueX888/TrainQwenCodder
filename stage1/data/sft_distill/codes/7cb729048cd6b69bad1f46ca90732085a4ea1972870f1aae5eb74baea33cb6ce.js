const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const centerX = 400;
  const centerY = 300;
  const radius = 80;
  const sides = 6;
  
  // 绘制红色六边形
  graphics.fillStyle(0xff0000, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 计算六边形顶点
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2; // 从顶部开始
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
  
  // 创建旋转动画
  // 使用 tweens 让六边形旋转
  this.tweens.add({
    targets: graphics,
    angle: 360, // 旋转到 360 度
    duration: 4000, // 4 秒完成一次旋转
    ease: 'Linear', // 线性缓动，保持匀速旋转
    repeat: -1, // 无限循环
    onRepeat: () => {
      // 每次循环重置角度，避免数值累积
      graphics.angle = 0;
    }
  });
  
  // 添加文字提示
  this.add.text(400, 50, '红色六边形旋转动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '4 秒完成一次旋转，无限循环', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);