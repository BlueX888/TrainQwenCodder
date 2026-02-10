const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制矩形，中心点在 (0, 0)，这样旋转时会围绕中心旋转
  const rectWidth = 150;
  const rectHeight = 80;
  graphics.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
  
  // 将 Graphics 对象定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象存储到 scene 的 data 中，方便 update 访问
  this.rotatingRect = graphics;
  
  // 添加说明文字
  this.add.text(10, 10, '矩形以每秒 120 度的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将每秒 120 度转换为弧度/毫秒
  // 120 度 = 120 * (Math.PI / 180) 弧度
  // delta 是毫秒，所以需要除以 1000
  const angularVelocity = (120 * Math.PI / 180) / 1000; // 弧度/毫秒
  
  // 更新旋转角度
  this.rotatingRect.rotation += angularVelocity * delta;
}

new Phaser.Game(config);