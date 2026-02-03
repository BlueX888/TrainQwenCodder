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

let hexagonCount = 0;
const MAX_HEXAGONS = 8;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点（半径为30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    hexPoints.push(x, y);
  }
  
  // 绘制紫色六边形
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.lineStyle(2, 0x8e44ad, 1); // 深紫色边框
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建定时器事件，每0.5秒生成一个六边形
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒
    callback: spawnHexagon,
    callbackScope: this,
    loop: true
  });
  
  // 生成六边形的函数
  function spawnHexagon() {
    if (hexagonCount >= MAX_HEXAGONS) {
      // 达到最大数量，移除定时器
      timerEvent.remove();
      return;
    }
    
    // 生成随机位置（考虑六边形大小，避免超出边界）
    const margin = 40;
    const randomX = Phaser.Math.Between(margin, this.scale.width - margin);
    const randomY = Phaser.Math.Between(margin, this.scale.height - margin);
    
    // 创建六边形精灵
    const hexagon = this.add.image(randomX, randomY, 'hexagon');
    
    // 添加淡入效果
    hexagon.setAlpha(0);
    this.tweens.add({
      targets: hexagon,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
    
    // 添加轻微的缩放动画
    hexagon.setScale(0.5);
    this.tweens.add({
      targets: hexagon,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    hexagonCount++;
    
    // 在控制台显示进度
    console.log(`生成第 ${hexagonCount} 个六边形`);
  }
  
  // 添加提示文本
  const text = this.add.text(10, 10, '每0.5秒生成一个紫色六边形\n最多生成8个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

// 创建游戏实例
new Phaser.Game(config);