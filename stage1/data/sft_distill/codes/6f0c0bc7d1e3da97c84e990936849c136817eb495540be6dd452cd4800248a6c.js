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
  // 创建 Graphics 对象绘制方块
  square = this.add.graphics();
  
  // 设置填充颜色为蓝色
  square.fillStyle(0x3498db, 1);
  
  // 绘制一个 100x100 的方块，中心点在原点
  // 使用负偏移使方块中心对齐旋转中心
  square.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到屏幕中心
  square.x = 400;
  square.y = 300;
}

function update(time, delta) {
  // 每秒旋转 120 度
  // delta 是毫秒，需要转换为秒
  // 120 度 = 120 * (Math.PI / 180) 弧度
  const rotationSpeed = 120 * (Math.PI / 180); // 每秒旋转的弧度数
  const deltaSeconds = delta / 1000; // 将毫秒转换为秒
  
  // 更新旋转角度
  square.rotation += rotationSpeed * deltaSeconds;
}

new Phaser.Game(config);