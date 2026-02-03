const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 旋转速度：每秒 160 度，转换为弧度
const ROTATION_SPEED = (160 * Math.PI) / 180;

let rectangle;

function preload() {
  // 不需要预加载资源
}

function create() {
  // 创建 Graphics 对象
  rectangle = this.add.graphics();
  
  // 设置填充颜色
  rectangle.fillStyle(0x00ff00, 1);
  
  // 绘制矩形，以中心点为原点
  // 矩形大小 150x100，中心在 (0, 0)
  rectangle.fillRect(-75, -50, 150, 100);
  
  // 将 Graphics 对象移动到画布中心
  rectangle.x = 400;
  rectangle.y = 300;
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 累加旋转角度
  rectangle.rotation += ROTATION_SPEED * deltaInSeconds;
  
  // 可选：当旋转超过 2π 时重置，避免数值过大
  if (rectangle.rotation >= Math.PI * 2) {
    rectangle.rotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);