const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制星形
  star = this.add.graphics();
  
  // 设置填充颜色为金黄色
  star.fillStyle(0xFFD700, 1);
  
  // 绘制星形：中心点 (400, 300)，5个角，外半径 100，内半径 50
  star.fillStar(400, 300, 5, 100, 50);
  
  // 设置旋转中心点为星形的中心
  // Graphics 的旋转是围绕其原点 (0, 0) 进行的
  // 由于我们在 (400, 300) 绘制了星形，需要调整
  // 更好的方式是先在原点绘制，然后移动 Graphics 对象
  star.clear();
  star.fillStyle(0xFFD700, 1);
  star.fillStar(0, 0, 5, 100, 50);
  star.setPosition(400, 300);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 每秒旋转 120 度 = 120 * (delta / 1000) 度每帧
  const rotationSpeed = Phaser.Math.DegToRad(120); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 更新星形的旋转角度
  star.rotation += rotationDelta;
}

new Phaser.Game(config);