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
  const hexagonRadius = 80;
  const centerX = hexagonRadius;
  const centerY = hexagonRadius;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  graphics.beginPath();
  
  // 计算六边形的六个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexagonRadius * Math.cos(angle);
    const y = centerY + hexagonRadius * Math.sin(angle);
    
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
  const textureSize = hexagonRadius * 2;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建六边形精灵并居中显示
  const hexagonSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  // 从 1 缩放到 0.32，再从 0.32 缩放到 1，总时长 3 秒
  this.tweens.add({
    targets: hexagonSprite,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 1500, // 1.5 秒缩小
    ease: 'Sine.easeInOut',
    yoyo: true, // 自动反向播放（恢复到原始大小）
    loop: -1, // 无限循环
    onLoop: function() {
      console.log('Tween loop completed');
    }
  });
  
  // 添加说明文字
  this.add.text(400, 50, 'Hexagon Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 1.0 → 0.32 → 1.0 (Loop)', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);