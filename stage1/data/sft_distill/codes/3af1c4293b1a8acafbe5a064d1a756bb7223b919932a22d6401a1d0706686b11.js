const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;
const FOLLOW_SPEED = 160; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 绘制六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色六边形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffa500, 1); // 橙色边框
  
  // 六边形的顶点坐标（半径为30）
  const radius = 30;
  const centerX = 32;
  const centerY = 32;
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取输入指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，六边形会平滑跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算六边形到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动六边形
  if (distance > 1) {
    // 计算六边形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间差计算本帧应该移动的距离
    // delta 是毫秒，需要转换为秒
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      hexagon.x = pointer.x;
      hexagon.y = pointer.y;
    } else {
      // 平滑移动
      hexagon.x += Math.cos(angle) * moveDistance;
      hexagon.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);