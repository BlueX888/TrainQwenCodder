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
const ELLIPSE_WIDTH = 80;
const ELLIPSE_HEIGHT = 50;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  graphics.fillEllipse(ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建椭圆精灵，初始位置在画布中心
  ellipse = this.add.sprite(config.width / 2, config.height / 2, 'ellipseTex');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  const text = this.add.text(10, 10, '使用方向键控制蓝色椭圆移动', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 检测方向键并更新位置
  if (cursors.left.isDown) {
    ellipse.x -= distance;
  }
  if (cursors.right.isDown) {
    ellipse.x += distance;
  }
  if (cursors.up.isDown) {
    ellipse.y -= distance;
  }
  if (cursors.down.isDown) {
    ellipse.y += distance;
  }
  
  // 限制椭圆在画布边界内
  // 考虑椭圆的半径，确保整个椭圆都在边界内
  const halfWidth = ELLIPSE_WIDTH / 2;
  const halfHeight = ELLIPSE_HEIGHT / 2;
  
  ellipse.x = Phaser.Math.Clamp(ellipse.x, halfWidth, config.width - halfWidth);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);