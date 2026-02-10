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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制方块
  square = this.add.graphics();
  square.fillStyle(0x00ff00, 1);
  
  // 绘制一个 100x100 的方块，中心点在 (0, 0)
  square.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到屏幕中心
  square.x = 400;
  square.y = 300;
}

function update(time, delta) {
  // 每秒旋转 360 度 = 2π 弧度
  // delta 是毫秒，转换为秒：delta / 1000
  // 旋转速度：2 * Math.PI 弧度/秒
  const rotationSpeed = 2 * Math.PI; // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  square.rotation += rotationIncrement;
}

new Phaser.Game(config);