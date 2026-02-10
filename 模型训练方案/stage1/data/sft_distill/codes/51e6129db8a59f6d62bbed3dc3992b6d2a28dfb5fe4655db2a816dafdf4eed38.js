const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 粉色颜色值
  const pinkColor = 0xff69b4;
  // 圆形半径（直径64像素，半径32像素）
  const radius = 32;
  
  // 创建5个随机位置的粉色圆形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置填充样式为粉色
    circle.fillStyle(pinkColor, 1);
    
    // 绘制圆形（圆心在原点，半径32）
    circle.fillCircle(0, 0, radius);
    
    // 设置随机位置（确保圆形完全在画布内）
    circle.setRandomPosition(
      radius,              // x 最小值
      radius,              // y 最小值
      800 - radius * 2,    // x 范围
      600 - radius * 2     // y 范围
    );
  }
}

new Phaser.Game(config);