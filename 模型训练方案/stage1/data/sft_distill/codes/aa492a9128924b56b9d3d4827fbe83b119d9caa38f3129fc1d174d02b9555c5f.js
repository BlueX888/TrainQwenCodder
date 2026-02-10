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
let currentRotation = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制方块
  square = this.add.graphics();
  square.fillStyle(0x00ff00, 1);
  
  // 绘制一个 100x100 的方块，中心点在 (0, 0)
  square.fillRect(-50, -50, 100, 100);
  
  // 设置方块位置到屏幕中心
  square.x = 400;
  square.y = 300;
  
  // 添加边框以便更清楚地看到旋转效果
  square.lineStyle(3, 0xffffff, 1);
  square.strokeRect(-50, -50, 100, 100);
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是毫秒，转换为秒：delta / 1000
  // 角度转弧度：Phaser.Math.DegToRad(80)
  const rotationSpeed = Phaser.Math.DegToRad(80); // 每秒 80 度（弧度制）
  
  // 累加旋转角度
  currentRotation += rotationSpeed * (delta / 1000);
  
  // 应用旋转
  square.setRotation(currentRotation);
}

new Phaser.Game(config);