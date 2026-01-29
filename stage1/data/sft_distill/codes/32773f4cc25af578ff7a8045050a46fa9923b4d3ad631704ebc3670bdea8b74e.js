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
  // 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  graphics.generateTexture('ellipseTex', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，放置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 获取方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 获取当前位置
  let x = ellipse.x;
  let y = ellipse.y;
  
  // 检测方向键并更新位置
  if (cursors.left.isDown) {
    x -= distance;
  }
  if (cursors.right.isDown) {
    x += distance;
  }
  if (cursors.up.isDown) {
    y -= distance;
  }
  if (cursors.down.isDown) {
    y += distance;
  }
  
  // 限制在画布边界内（考虑椭圆的半径）
  const halfWidth = ellipse.width / 2;
  const halfHeight = ellipse.height / 2;
  
  ellipse.x = Phaser.Math.Clamp(x, halfWidth, config.width - halfWidth);
  ellipse.y = Phaser.Math.Clamp(y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);