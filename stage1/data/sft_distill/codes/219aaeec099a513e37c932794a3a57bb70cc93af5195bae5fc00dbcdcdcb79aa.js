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

// 旋转容器
let circleContainer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 设置填充样式并绘制圆形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 50);
  
  // 在圆形上添加一个标记点，用于观察旋转效果
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(40, 0, 8);
  
  // 创建容器并将 graphics 添加进去
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 添加提示文本
  const text = this.add.text(10, 10, '圆形以每秒 80 度的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差
  // 每秒 80 度 = 每毫秒 80/1000 度
  // 转换为弧度：度数 * (Math.PI / 180)
  const degreesPerSecond = 80;
  const radiansPerMillisecond = (degreesPerSecond * Math.PI / 180) / 1000;
  
  // 累加旋转角度
  circleContainer.rotation += radiansPerMillisecond * delta;
}

new Phaser.Game(config);