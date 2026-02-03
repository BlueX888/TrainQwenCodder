const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象并绘制星形
  star = this.add.graphics();
  
  // 设置填充颜色为黄色
  star.fillStyle(0xffff00, 1);
  
  // 绘制星形：中心点 (400, 300)，5个角，外半径100，内半径40
  star.fillStar(400, 300, 5, 100, 40);
  
  // 设置旋转中心点为星形中心
  star.setPosition(0, 0);
}

function update(time, delta) {
  // 每秒旋转160度
  // delta 是毫秒，需要转换为秒
  // 160度 = 160 * (Math.PI / 180) 弧度
  const rotationSpeed = 160 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 累加旋转角度
  star.rotation += rotationDelta;
}

new Phaser.Game(config);