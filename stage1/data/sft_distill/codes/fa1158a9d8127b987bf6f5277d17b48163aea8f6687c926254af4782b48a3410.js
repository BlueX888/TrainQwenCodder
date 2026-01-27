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

let circleContainer;
const ROTATION_SPEED = 80; // 每秒 80 度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制一个红色圆形，添加一条线以便观察旋转
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(0, 0, 50);
  
  // 绘制一条白色线从圆心指向右侧，用于观察旋转效果
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(50, 0);
  graphics.strokePath();
  
  // 创建容器并将 graphics 添加到容器中
  // 容器放置在屏幕中心
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 添加文字提示
  this.add.text(10, 10, '圆形以每秒 80 度的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是自上一帧以来的毫秒数
  // 计算本帧应该旋转的角度（度）
  const rotationThisFrame = ROTATION_SPEED * (delta / 1000);
  
  // 将角度转换为弧度并累加到容器的旋转值
  circleContainer.rotation += Phaser.Math.DegToRad(rotationThisFrame);
}

new Phaser.Game(config);