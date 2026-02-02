const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制六边形（中心点在原点）
  const radius = 30;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2 + 10, radius * 2 + 10);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算六边形与鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      pointer.x,
      pointer.y
    );
    
    // 计算移动速度（像素/秒转换为像素/帧）
    const speed = 360;
    const moveDistance = (speed * delta) / 1000;
    
    // 如果移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      hexagon.x = pointer.x;
      hexagon.y = pointer.y;
    } else {
      // 根据角度和速度移动
      hexagon.x += Math.cos(angle) * moveDistance;
      hexagon.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);