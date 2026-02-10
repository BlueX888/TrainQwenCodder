const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let ellipse;
let cursors;
const SPEED = 120;

function preload() {
  // 创建粉色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(30, 20, 60, 40); // 中心点(30,20)，宽60，高40
  graphics.generateTexture('ellipseTex', 60, 40);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，放置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 获取方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加说明文字
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -moveDistance;
  } else if (cursors.right.isDown) {
    velocityX = moveDistance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -moveDistance;
  } else if (cursors.down.isDown) {
    velocityY = moveDistance;
  }
  
  // 更新椭圆位置
  ellipse.x += velocityX;
  ellipse.y += velocityY;
  
  // 限制在画布边界内（考虑椭圆的宽高）
  const halfWidth = ellipse.width / 2;
  const halfHeight = ellipse.height / 2;
  
  ellipse.x = Phaser.Math.Clamp(ellipse.x, halfWidth, config.width - halfWidth);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);