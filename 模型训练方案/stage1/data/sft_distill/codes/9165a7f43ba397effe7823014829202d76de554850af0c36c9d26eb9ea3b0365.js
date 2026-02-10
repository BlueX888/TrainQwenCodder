const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制星形
  this.star = this.add.graphics();
  
  // 设置填充颜色为金黄色
  this.star.fillStyle(0xFFD700, 1);
  
  // 绘制星形：5个点，外半径80，内半径40
  // fillStar(x, y, points, innerRadius, outerRadius)
  this.star.fillStar(400, 300, 5, 40, 80);
  
  // 初始化旋转角度
  this.currentRotation = 0;
}

function update(time, delta) {
  // 每秒旋转 120 度
  // 120 度 = 120 * Math.PI / 180 = 2.0944 弧度
  const rotationSpeed = (120 * Math.PI / 180); // 弧度/秒
  
  // 根据帧时间增量计算本帧应旋转的角度
  // delta 是毫秒，需要转换为秒
  this.currentRotation += rotationSpeed * (delta / 1000);
  
  // 应用旋转到星形
  this.star.rotation = this.currentRotation;
}

new Phaser.Game(config);