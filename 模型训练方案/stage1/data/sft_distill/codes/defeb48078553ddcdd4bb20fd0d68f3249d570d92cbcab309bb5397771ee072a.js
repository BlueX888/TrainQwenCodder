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

// 旋转速度：每秒 160 度
const ROTATION_SPEED = Phaser.Math.DegToRad(160);

let circleContainer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制主圆形（蓝色）
  graphics.fillStyle(0x3498db, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一个小圆点作为旋转标记（红色）
  graphics.fillStyle(0xe74c3c, 1);
  graphics.fillCircle(60, 0, 15);
  
  // 绘制一条线作为旋转参考（白色）
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.lineBetween(0, 0, 60, 0);
  
  // 创建容器并将 graphics 添加进去
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 添加文字说明
  this.add.text(400, 50, '圆形旋转速度: 160°/秒', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '观察红色标记点和白色线条的旋转', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 将其转换为秒：delta / 1000
  // 计算本帧应该旋转的角度：ROTATION_SPEED * (delta / 1000)
  const rotationThisFrame = ROTATION_SPEED * (delta / 1000);
  
  // 更新容器的旋转角度
  circleContainer.rotation += rotationThisFrame;
}

new Phaser.Game(config);