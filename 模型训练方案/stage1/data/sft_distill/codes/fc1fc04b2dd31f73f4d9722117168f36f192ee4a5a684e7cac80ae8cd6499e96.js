const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 无重力
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);  // 白色
  
  // 绘制椭圆（中心点在原点，宽度100，高度60）
  const ellipseWidth = 100;
  const ellipseHeight = 60;
  graphics.fillEllipse(0, 0, ellipseWidth, ellipseHeight);
  
  // 设置椭圆初始位置在画布中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 为 Graphics 对象添加物理体
  this.physics.add.existing(graphics);
  
  // 配置物理体属性
  graphics.body.setCircle(ellipseWidth / 2);  // 设置碰撞区域为圆形（近似椭圆）
  graphics.body.setBounce(1, 1);  // 完全弹性碰撞（x和y方向都为1）
  graphics.body.setCollideWorldBounds(true);  // 与世界边界碰撞
  
  // 设置初始速度（斜向移动，速度大小为200）
  // 使用勾股定理计算：vx² + vy² = 200²
  const speed = 200;
  const angle = Math.PI / 4;  // 45度角
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);
  graphics.body.setVelocity(vx, vy);
  
  // 保存引用以便后续使用
  this.ellipse = graphics;
}

function update(time, delta) {
  // 物理引擎自动处理移动和反弹，无需手动更新
}

new Phaser.Game(config);