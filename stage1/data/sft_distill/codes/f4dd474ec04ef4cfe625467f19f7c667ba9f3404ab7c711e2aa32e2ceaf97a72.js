const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let ellipse;
let cursors;
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建椭圆精灵，放置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -distance;
  } else if (cursors.right.isDown) {
    velocityX = distance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -distance;
  } else if (cursors.down.isDown) {
    velocityY = distance;
  }
  
  // 更新椭圆位置
  ellipse.x += velocityX;
  ellipse.y += velocityY;
  
  // 限制在画布边界内
  const halfWidth = ellipse.width / 2;
  const halfHeight = ellipse.height / 2;
  
  if (ellipse.x - halfWidth < 0) {
    ellipse.x = halfWidth;
  } else if (ellipse.x + halfWidth > config.width) {
    ellipse.x = config.width - halfWidth;
  }
  
  if (ellipse.y - halfHeight < 0) {
    ellipse.y = halfHeight;
  } else if (ellipse.y + halfHeight > config.height) {
    ellipse.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);