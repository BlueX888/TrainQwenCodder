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

let rotatingContainer;
const ROTATION_SPEED = Phaser.Math.DegToRad(160); // 每秒 160 度转换为弧度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建一个容器用于旋转
  rotatingContainer = this.add.container(400, 300);
  
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制主圆形（蓝色）
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一个标记矩形，用于观察旋转效果（红色）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, -10, 60, 20);
  
  // 绘制圆形边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokeCircle(0, 0, 80);
  
  // 将 graphics 添加到容器中
  rotatingContainer.add(graphics);
  
  // 添加文字说明
  this.add.text(400, 50, '圆形旋转速度: 160°/秒', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '红色矩形标记用于观察旋转效果', {
    fontSize: '18px',
    color: '#cccccc',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 将其转换为秒并乘以旋转速度
  const deltaInSeconds = delta / 1000;
  rotatingContainer.rotation += ROTATION_SPEED * deltaInSeconds;
}

new Phaser.Game(config);