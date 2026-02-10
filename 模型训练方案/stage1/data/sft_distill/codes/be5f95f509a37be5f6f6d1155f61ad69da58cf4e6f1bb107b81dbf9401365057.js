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

let square;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制一个方块
  square = this.add.graphics();
  square.fillStyle(0xff6b6b, 1);
  
  // 绘制一个 100x100 的方块，中心点在原点
  square.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到屏幕中心
  square.x = 400;
  square.y = 300;
}

function update(time, delta) {
  // 每秒旋转 120 度
  // 120 度 = 120 * (Math.PI / 180) 弧度 ≈ 2.094 弧度
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = (120 * Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 累加旋转角度
  square.rotation += rotationDelta;
}

new Phaser.Game(config);