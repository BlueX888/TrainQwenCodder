const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let square;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制方块
  square = this.add.graphics();
  
  // 设置填充颜色为蓝色
  square.fillStyle(0x00aaff, 1);
  
  // 绘制一个 100x100 的方块，中心点在 (0, 0)
  // 这样旋转时会围绕中心旋转
  square.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到屏幕中心
  square.x = 400;
  square.y = 300;
  
  // 初始旋转角度为 0
  square.rotation = 0;
  
  // 添加说明文字
  this.add.text(10, 10, '方块以每秒 300 度的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 每秒旋转 300 度
  // 将度数转换为弧度：300 度 = 300 * (Math.PI / 180) 弧度
  // delta 是毫秒，所以除以 1000 转换为秒
  const rotationSpeed = 300 * (Math.PI / 180); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 更新方块旋转角度
  square.rotation += rotationIncrement;
  
  // 可选：将旋转角度限制在 0 到 2π 之间，避免数值过大
  if (square.rotation > Math.PI * 2) {
    square.rotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);