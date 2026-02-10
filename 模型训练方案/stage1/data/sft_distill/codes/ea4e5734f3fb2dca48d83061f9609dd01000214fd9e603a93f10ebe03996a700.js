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

let star;
let cursors;
const SPEED = 360;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  
  // 绘制五角星
  // fillStar(x, y, points, innerRadius, outerRadius)
  graphics.fillStar(25, 25, 5, 10, 25);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 50, 50);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在画布中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，delta 单位为毫秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
  if (cursors.left.isDown) {
    star.x -= distance;
  }
  if (cursors.right.isDown) {
    star.x += distance;
  }
  if (cursors.up.isDown) {
    star.y -= distance;
  }
  if (cursors.down.isDown) {
    star.y += distance;
  }
  
  // 限制星形在画布边界内
  // 考虑星形的宽度和高度（50x50）
  const halfWidth = star.width / 2;
  const halfHeight = star.height / 2;
  
  star.x = Phaser.Math.Clamp(star.x, halfWidth, config.width - halfWidth);
  star.y = Phaser.Math.Clamp(star.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);