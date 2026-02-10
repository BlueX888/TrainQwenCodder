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
  // 计数器，记录已生成的六边形数量
  let hexagonCount = 0;
  const maxHexagons = 10;
  
  // 六边形半径
  const hexRadius = 30;
  
  // 创建定时器事件，每隔2秒触发一次
  this.time.addEvent({
    delay: 2000,                    // 延迟2000毫秒（2秒）
    callback: spawnHexagon,         // 回调函数
    callbackScope: this,            // 回调函数的作用域
    repeat: maxHexagons - 1,        // 重复9次（加上首次共10次）
    loop: false                     // 不循环
  });
  
  // 生成六边形的函数
  function spawnHexagon() {
    hexagonCount++;
    
    // 生成随机位置，确保六边形完全在画布内
    const x = Phaser.Math.Between(hexRadius + 10, 800 - hexRadius - 10);
    const y = Phaser.Math.Between(hexRadius + 10, 600 - hexRadius - 10);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xFFFF00, 1);
    
    // 计算六边形的6个顶点坐标
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
      const px = x + hexRadius * Math.cos(angle);
      const py = y + hexRadius * Math.sin(angle);
      points.push(new Phaser.Geom.Point(px, py));
    }
    
    // 绘制六边形
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 添加描边使六边形更明显
    graphics.lineStyle(2, 0xFFDD00, 1);
    graphics.strokePath();
    
    // 在控制台输出生成信息
    console.log(`生成第 ${hexagonCount} 个六边形，位置: (${Math.round(x)}, ${Math.round(y)})`);
  }
}

new Phaser.Game(config);