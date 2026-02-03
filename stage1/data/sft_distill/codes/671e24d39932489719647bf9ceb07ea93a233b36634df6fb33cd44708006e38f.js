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
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 80;
  const sides = 6;
  const centerX = 100; // 临时中心点用于绘制
  const centerY = 100;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  graphics.beginPath();
  
  for (let i = 0; i <= sides; i++) {
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
  graphics.strokePath();
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建六边形精灵并放置在屏幕中心
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  // 4秒完成一个完整循环：2秒缩小到32%，2秒恢复到100%
  this.tweens.add({
    targets: hexagon,
    scale: 0.32,           // 缩放到32%
    duration: 2000,        // 2秒缩小
    yoyo: true,            // 反向播放（恢复原大小）
    repeat: -1,            // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Hexagon Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% -> 32% -> 100% (4 seconds loop)', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);