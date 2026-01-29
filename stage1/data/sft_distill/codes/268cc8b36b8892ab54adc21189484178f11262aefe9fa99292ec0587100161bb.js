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
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 50;
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
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
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建使用六边形纹理的图像对象
  const hexagon = this.add.image(400, 300, 'hexagon');
  
  // 设置初始透明度为 0
  hexagon.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexagon,
    alpha: 1,
    duration: 500,
    ease: 'Linear',
    yoyo: true, // 来回播放（透明->不透明->透明）
    repeat: -1  // 无限循环
  });
  
  // 添加说明文字
  this.add.text(400, 500, 'Hexagon fading in/out (0.5s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);