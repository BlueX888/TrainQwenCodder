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

let star;
let cursors;
const SPEED = 120;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  
  // 绘制五角星
  // fillStar(x, y, points, innerRadius, outerRadius)
  graphics.fillStar(32, 32, 5, 15, 30);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在画布中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间增量，转换为秒）
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
  
  // 更新位置
  star.x += velocityX;
  star.y += velocityY;
  
  // 限制在画布边界内
  // 考虑星形的宽度和高度（64x64）
  const halfWidth = star.width / 2;
  const halfHeight = star.height / 2;
  
  star.x = Phaser.Math.Clamp(star.x, halfWidth, config.width - halfWidth);
  star.y = Phaser.Math.Clamp(star.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);