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

// 旋转速度：每秒 80 度
const ROTATION_SPEED = 80;

// 用于存储方块对象
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
  
  // 添加提示文本
  this.add.text(10, 10, '方块旋转速度: 80度/秒', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是上一帧到当前帧的时间差（毫秒）
  // 计算本帧应该旋转的角度（度）
  const rotationDegrees = ROTATION_SPEED * (delta / 1000);
  
  // 将角度转换为弧度（Phaser 使用弧度）
  const rotationRadians = Phaser.Math.DegToRad(rotationDegrees);
  
  // 累加旋转角度
  square.rotation += rotationRadians;
}

new Phaser.Game(config);