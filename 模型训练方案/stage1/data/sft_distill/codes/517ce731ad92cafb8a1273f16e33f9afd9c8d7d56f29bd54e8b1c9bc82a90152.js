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
  
  // 设置填充颜色为红色
  square.fillStyle(0xff0000, 1);
  
  // 绘制一个 100x100 的方块，中心点在 (0, 0)
  square.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到屏幕中心
  square.x = 400;
  square.y = 300;
}

function update(time, delta) {
  // delta 是上一帧到当前帧的时间差（毫秒）
  // 每秒 360 度 = 每毫秒 360/1000 度 = 每毫秒 0.36 度
  // 转换为弧度：度 * Math.PI / 180
  const rotationSpeed = (360 * Math.PI / 180) / 1000; // 弧度/毫秒
  
  // 累加旋转角度
  square.rotation += rotationSpeed * delta;
}

new Phaser.Game(config);