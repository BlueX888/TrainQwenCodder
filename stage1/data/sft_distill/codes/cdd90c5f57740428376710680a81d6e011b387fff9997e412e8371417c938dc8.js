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

let diamond;
let cursors;
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 绘制菱形路径（中心点为原点）
  const diamondPath = new Phaser.Geom.Polygon([
    0, -30,   // 上顶点
    30, 0,    // 右顶点
    0, 30,    // 下顶点
    -30, 0    // 左顶点
  ]);
  
  graphics.fillPoints(diamondPath.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 60, 60);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在画布中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -1;
  } else if (cursors.right.isDown) {
    velocityX = 1;
  }
  
  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }
  
  // 对角线移动时归一化速度
  if (velocityX !== 0 && velocityY !== 0) {
    velocityX *= Math.SQRT1_2;
    velocityY *= Math.SQRT1_2;
  }
  
  // 更新位置
  diamond.x += velocityX * distance;
  diamond.y += velocityY * distance;
  
  // 限制在画布边界内（考虑菱形的半径30）
  diamond.x = Phaser.Math.Clamp(diamond.x, 30, config.width - 30);
  diamond.y = Phaser.Math.Clamp(diamond.y, 30, config.height - 30);
}

new Phaser.Game(config);