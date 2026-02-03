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
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制六边形
    const graphics = this.add.graphics();
    
    // 设置青色填充
    graphics.fillStyle(0x00ffff, 1);
    
    // 计算六边形的6个顶点
    // 六边形半径为8像素（直径16像素）
    const radius = 8;
    const centerX = pointer.x;
    const centerY = pointer.y;
    const points = [];
    
    // 从顶部开始，逆时针计算6个顶点坐标
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // 每个顶点间隔60度，起始角度-90度使顶点朝上
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(new Phaser.Geom.Point(x, y));
    }
    
    // 创建多边形并填充
    const hexagon = new Phaser.Geom.Polygon(points);
    graphics.fillPoints(hexagon.points, true);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create cyan hexagons', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);