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
  // 创建黄色六边形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制六边形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffd700, 1); // 金色边框
  
  const hexagonRadius = 40;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = hexagonRadius * Math.cos(angle * i - Math.PI / 2) + 50;
    const y = hexagonRadius * Math.sin(angle * i - Math.PI / 2) + 50;
    
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
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵
  const hexagon = this.add.sprite(100, 300, 'hexagon');
  
  // 创建往返循环的补间动画
  this.tweens.add({
    targets: hexagon,
    x: 700, // 从左(100)移动到右(700)
    duration: 2000, // 2秒
    ease: 'Linear', // 线性移动
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, '黄色六边形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);