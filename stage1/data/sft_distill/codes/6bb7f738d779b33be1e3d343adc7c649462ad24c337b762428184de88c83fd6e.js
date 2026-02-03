const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffa500, 1); // 橙色边框
  
  // 绘制六边形（中心点为 40, 40，半径为 30）
  const hexRadius = 30;
  const hexCenterX = 40;
  const hexCenterY = 40;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = hexCenterX + hexRadius * Math.cos(angle);
    const y = hexCenterY + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 80, 80);
  graphics.destroy();
  
  // 创建六边形精灵
  this.hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 存储跟随速度（每秒移动的像素比例）
  this.followSpeed = 80;
  
  // 添加指针移动提示文本
  this.add.text(10, 10, '移动鼠标，六边形会平滑跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算跟随因子（基于 delta 时间，确保帧率无关的平滑移动）
  // followSpeed 是每秒移动的速度，delta 是毫秒
  const followFactor = Math.min(1, (this.followSpeed * delta) / 1000);
  
  // 使用线性插值实现平滑跟随
  this.hexagon.x = Phaser.Math.Linear(this.hexagon.x, pointer.x, followFactor);
  this.hexagon.y = Phaser.Math.Linear(this.hexagon.y, pointer.y, followFactor);
}

new Phaser.Game(config);