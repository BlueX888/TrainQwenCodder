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
  // 创建 Graphics 对象并绘制方块
  square = this.add.graphics();
  square.fillStyle(0xff6b6b, 1);
  
  // 绘制一个 100x100 的方块，中心点在原点
  square.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到屏幕中心
  square.x = 400;
  square.y = 300;
  
  // 添加提示文本
  const text = this.add.text(400, 50, '方块旋转速度: 120°/秒', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 将每秒 120 度转换为每毫秒的弧度增量
  // 120 度 = 120 * (Math.PI / 180) 弧度
  const rotationSpeed = (120 * Math.PI / 180) / 1000; // 弧度/毫秒
  
  // 更新旋转角度
  square.rotation += rotationSpeed * delta;
}

new Phaser.Game(config);