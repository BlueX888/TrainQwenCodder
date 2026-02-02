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
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 菱形大小（对角线长度的一半）
  const size = 24;
  
  // 绘制菱形路径
  graphics.beginPath();
  
  // 菱形的四个顶点（上、右、下、左）
  graphics.moveTo(centerX, centerY - size);        // 顶点
  graphics.lineTo(centerX + size, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size);        // 底顶点
  graphics.lineTo(centerX - size, centerY);        // 左顶点
  
  // 闭合路径
  graphics.closePath();
  
  // 填充菱形
  graphics.fillPath();
}

new Phaser.Game(config);