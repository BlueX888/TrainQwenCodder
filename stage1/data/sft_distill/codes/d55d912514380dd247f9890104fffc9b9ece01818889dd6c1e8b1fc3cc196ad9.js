const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 计数器，记录已生成的六边形数量
  let hexagonCount = 0;
  const maxHexagons = 15;
  
  // 使用Graphics绘制六边形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 计算六边形的顶点坐标（中心在原点，半径为30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push(
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    );
  }
  
  // 绘制六边形
  const polygon = new Phaser.Geom.Polygon(hexPoints);
  graphics.fillPoints(polygon.points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy(); // 销毁临时graphics对象
  
  // 创建定时器事件，每0.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: () => {
      if (hexagonCount < maxHexagons) {
        // 生成随机位置（确保六边形完全在画布内）
        const x = Phaser.Math.Between(radius, config.width - radius);
        const y = Phaser.Math.Between(radius, config.height - radius);
        
        // 创建六边形精灵
        this.add.image(x, y, 'hexagon');
        
        // 增加计数器
        hexagonCount++;
        
        // 输出日志（可选）
        console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
      } else {
        // 达到最大数量，移除定时器
        timerEvent.remove();
        console.log('已生成15个六边形，停止生成');
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
}

new Phaser.Game(config);