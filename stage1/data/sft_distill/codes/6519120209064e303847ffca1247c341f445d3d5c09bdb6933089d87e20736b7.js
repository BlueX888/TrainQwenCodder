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
  
  // 设置填充颜色为蓝色
  square.fillStyle(0x3498db, 1);
  
  // 绘制一个 100x100 的方块，中心点在原点
  square.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到画布中心
  square.x = 400;
  square.y = 300;
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是毫秒，需要转换为秒
  // 旋转速度：80 度/秒
  const rotationSpeed = 80; // 度/秒
  const deltaInSeconds = delta / 1000; // 转换为秒
  
  // 计算本帧应该旋转的角度
  const angleIncrement = rotationSpeed * deltaInSeconds;
  
  // 更新方块的角度
  square.angle += angleIncrement;
}

new Phaser.Game(config);