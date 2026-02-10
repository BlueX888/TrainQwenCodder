const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let circle;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  circle = this.add.graphics();
  
  // 设置圆形位置到屏幕中央
  circle.x = 400;
  circle.y = 300;
  
  // 绘制圆形主体
  circle.fillStyle(0x00aaff, 1);
  circle.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的线作为旋转标记
  circle.lineStyle(4, 0xffffff, 1);
  circle.beginPath();
  circle.moveTo(0, 0);
  circle.lineTo(80, 0);
  circle.strokePath();
  
  // 在圆形边缘添加一个小圆点作为额外的旋转参考
  circle.fillStyle(0xff0000, 1);
  circle.fillCircle(80, 0, 10);
  
  // 添加提示文本
  const text = this.add.text(400, 50, '圆形以每秒 360° 的速度旋转', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 计算旋转增量
  // 每秒 360 度 = 2π 弧度/秒
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = Math.PI * 2; // 2π 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000); // 根据帧时间计算旋转增量
  
  // 更新圆形的旋转角度
  circle.rotation += rotationDelta;
}

new Phaser.Game(config);