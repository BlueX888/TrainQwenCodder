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

let ellipse;
let cursors;
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制蓝色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  
  // 生成纹理
  graphics.generateTexture('ellipseTexture', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵，初始位置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTexture');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动速度（像素/秒转换为像素/帧）
  const velocity = {
    x: 0,
    y: 0
  };
  
  // 根据按键状态设置速度
  if (cursors.left.isDown) {
    velocity.x = -SPEED;
  } else if (cursors.right.isDown) {
    velocity.x = SPEED;
  }
  
  if (cursors.up.isDown) {
    velocity.y = -SPEED;
  } else if (cursors.down.isDown) {
    velocity.y = SPEED;
  }
  
  // 根据 delta 时间更新位置
  const deltaSeconds = delta / 1000;
  ellipse.x += velocity.x * deltaSeconds;
  ellipse.y += velocity.y * deltaSeconds;
  
  // 限制在画布边界内（考虑椭圆的宽高）
  const halfWidth = ellipse.width / 2;
  const halfHeight = ellipse.height / 2;
  
  ellipse.x = Phaser.Math.Clamp(
    ellipse.x,
    halfWidth,
    config.width - halfWidth
  );
  
  ellipse.y = Phaser.Math.Clamp(
    ellipse.y,
    halfHeight,
    config.height - halfHeight
  );
}

new Phaser.Game(config);