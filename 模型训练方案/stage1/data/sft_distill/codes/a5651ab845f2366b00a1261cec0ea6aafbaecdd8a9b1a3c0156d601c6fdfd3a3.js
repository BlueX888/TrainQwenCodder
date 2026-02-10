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

// 六边形计数器
let hexagonCount = 0;
const MAX_HEXAGONS = 15;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建青色六边形纹理
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形（半径30像素）
  const hexRadius = 30;
  const hexPoints = [];
  
  // 计算六边形的6个顶点坐标
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理（尺寸为六边形外接矩形）
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  
  // 清除 graphics 对象
  graphics.destroy();
  
  // 创建定时器事件，每 0.5 秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: spawnHexagon,
    callbackScope: this,
    loop: true
  });
  
  // 生成六边形的函数
  function spawnHexagon() {
    if (hexagonCount >= MAX_HEXAGONS) {
      // 达到最大数量，移除定时器
      timerEvent.remove();
      console.log('已生成 15 个六边形，停止生成');
      return;
    }
    
    // 生成随机位置（考虑六边形半径，避免超出边界）
    const margin = 30;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    
    // 创建六边形精灵
    const hexagon = this.add.image(randomX, randomY, 'hexagon');
    
    // 增加计数
    hexagonCount++;
    
    console.log(`生成第 ${hexagonCount} 个六边形，位置: (${randomX}, ${randomY})`);
  }
}

// 创建游戏实例
new Phaser.Game(config);