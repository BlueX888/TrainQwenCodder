const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const centerX = 400;
  const centerY = 300;
  const radius = 100;
  const sides = 6;
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制六边形
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: graphics,
    alpha: 1,              // 目标透明度：完全不透明
    duration: 3000,        // 持续时间：3 秒
    ease: 'Linear',        // 线性缓动
    yoyo: true,            // 往返播放（1 -> 0 -> 1）
    repeat: -1             // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, '六边形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '3 秒内从透明到不透明，循环播放', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);