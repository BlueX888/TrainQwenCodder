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
  // 使用 Graphics 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  graphics.generateTexture('ellipseTex', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，初始位置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 转换为秒（delta 是毫秒）
  const deltaSeconds = delta / 1000;
  
  // 计算移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据方向键状态更新位置
  if (cursors.left.isDown) {
    ellipse.x -= moveDistance;
  }
  if (cursors.right.isDown) {
    ellipse.x += moveDistance;
  }
  if (cursors.up.isDown) {
    ellipse.y -= moveDistance;
  }
  if (cursors.down.isDown) {
    ellipse.y += moveDistance;
  }
  
  // 限制椭圆在画布边界内
  // 椭圆的半宽为30，半高为20
  const halfWidth = 30;
  const halfHeight = 20;
  
  ellipse.x = Phaser.Math.Clamp(ellipse.x, halfWidth, config.width - halfWidth);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);