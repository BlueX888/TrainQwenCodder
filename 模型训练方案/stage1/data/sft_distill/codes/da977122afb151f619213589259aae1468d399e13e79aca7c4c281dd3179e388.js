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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 80; // 六边形半径
  const centerX = 100; // 临时中心点用于绘制
  const centerY = 100;
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制六边形路径
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
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('hexagon', hexRadius * 2 + 20, hexRadius * 2 + 20);
  
  // 销毁 Graphics 对象（已生成纹理，不再需要）
  graphics.destroy();
  
  // 在场景中心创建六边形 Sprite
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 初始设置为完全透明
  hexSprite.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexSprite,
    alpha: 1, // 目标 alpha 值
    duration: 2000, // 持续时间 2 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 来回播放（透明->不透明->透明）
    repeat: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Hexagon fading animation (2s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);