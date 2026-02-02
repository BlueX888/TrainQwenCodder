const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let square;
let rotationSpeed; // 弧度/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制方块
  square = this.add.graphics();
  square.fillStyle(0x00ff00, 1);
  
  // 绘制一个以中心为原点的方块（便于旋转）
  const size = 100;
  square.fillRect(-size / 2, -size / 2, size, size);
  
  // 设置方块位置在屏幕中心
  square.x = 400;
  square.y = 300;
  
  // 设置旋转速度：120度/秒 = 120 * (Math.PI / 180) 弧度/秒
  rotationSpeed = Phaser.Math.DegToRad(120);
}

function update(time, delta) {
  // delta 是毫秒，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 累加旋转角度
  square.rotation += rotationSpeed * deltaInSeconds;
}

new Phaser.Game(config);