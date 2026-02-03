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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点
  const hexRadius = 30;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexPoints.push({ x, y });
  }
  
  // 绘制紫色六边形
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.lineStyle(2, 0x7b2db8, 1); // 深紫色边框
  
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
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
      // 达到最大数量，停止定时器
      timerEvent.remove();
      return;
    }
    
    // 生成随机位置（确保六边形完全在画布内）
    const padding = 40;
    const randomX = Phaser.Math.Between(padding, this.scale.width - padding);
    const randomY = Phaser.Math.Between(padding, this.scale.height - padding);
    
    // 创建六边形精灵
    const hexagon = this.add.image(randomX, randomY, 'hexagon');
    
    // 添加简单的缩放动画效果
    hexagon.setScale(0);
    this.tweens.add({
      targets: hexagon,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    hexagonCount++;
    
    // 在控制台显示进度
    console.log(`生成第 ${hexagonCount} 个六边形，位置: (${randomX}, ${randomY})`);
  }
}

new Phaser.Game(config);