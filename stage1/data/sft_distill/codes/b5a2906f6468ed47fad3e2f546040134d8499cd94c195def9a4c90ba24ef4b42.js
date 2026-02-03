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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建一个容器用于旋转
  circleContainer = this.add.container(400, 300);
  
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制一个红色圆形，圆心在原点
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(0, 0, 50);
  
  // 在圆形上添加一个标记点，用于观察旋转效果
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(40, 0, 8);
  
  // 将 graphics 添加到容器中
  circleContainer.add(graphics);
  
  // 添加说明文字
  const text = this.add.text(400, 50, '圆形以每秒 80° 旋转', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 每秒 80 度 = 80 * (Math.PI / 180) 弧度/秒
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = 80 * (Math.PI / 180); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 累加旋转角度
  circleContainer.rotation += rotationIncrement;
}

new Phaser.Game(config);