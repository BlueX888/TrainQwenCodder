const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 计算菱形中心点（画布中央）
  const centerX = 400;
  const centerY = 300;
  
  // 菱形大小（从中心到顶点的距离）
  const size = 24; // 菱形对角线的一半，整体约 48 像素
  
  // 计算菱形的四个顶点坐标
  const top = { x: centerX, y: centerY - size };      // 上顶点
  const right = { x: centerX + size, y: centerY };    // 右顶点
  const bottom = { x: centerX, y: centerY + size };   // 下顶点
  const left = { x: centerX - size, y: centerY };     // 左顶点
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 从上顶点开始，按顺时针方向连接各顶点
  graphics.moveTo(top.x, top.y);
  graphics.lineTo(right.x, right.y);
  graphics.lineTo(bottom.x, bottom.y);
  graphics.lineTo(left.x, left.y);
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);